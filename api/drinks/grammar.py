from lark import Lark, Token
from .models import Recipe, Quantity, Ingredient, UserIngredient
from django.db.models import Q


# TODO: Get these from DB
UNITS = ('oz', 'dash', 'pinch', 'leaf', 'wedge')
OPS = {
    '>': 'gt',
    '=': 'exact',
    '<': 'lt',
    '>=': 'gte',
    '<=': 'lte'
}

# Attributes - these can never be a search term
ALIASES = {
    'comments': 'comment_count',
    'desc': 'description',
    'description': 'description',
    'source': 'source',
    'name': 'name',
    'directions': 'directions'
}
unit_keys = '"i|"'.join(UNITS)

grammar = Lark('''
    // Top level
    start: query | nested

    // Nested rules
    nested: \
        "NOT" query -> exclude | \
        "LIKE" query -> like | \
        "ALMOST" "LIKE" query -> almost_like | \
        query COMBINER query -> combined

    // Core rules
    query: \
        nested | \
        attr_constraint | \
        list_constraint | \
        book_constraint | \
        tags_constraint | \
        cabinet | \
        constraint | \
        search_term | \
        attr_search

    attr_constraint.2: NUM_ATTR OPERATOR NUMBER
    list_constraint.2: "list"i "=" SEARCH_TERM
    book_constraint.2: "book"i "=" SEARCH_TERM
    tags_constraint.2: ("tag"i | "tags"i) "=" SEARCH_TERM
    cabinet: "cabinet"i "=" ("true"i | "1") | "cabinet"i
    constraint: SEARCH_TERM OPERATOR NUMBER [UNIT]
    search_term: SEARCH_TERM
    attr_search: ATTR "=" SEARCH_TERM

    // Tokens
    COMBINER: ("AND" | "OR")
    NUM_ATTR.2: "comments"i
    ATTR: ("name"i | "description"i | "directions"i | "source"i)
    SEARCH_TERM: /((?!AND|OR|NOT|LIKE)[^<=> ])+(\s((?!AND|OR|NOT)[^<=> ])+)*/
    OPERATOR: ("<="|">="|"="|"<"|">")
    UNIT: ("%s"i)
    WHITESPACE: (" " | "\\n")+
    NUMBER: (INT"/"INT | INT+["."INT+] | "."INT+ )

    // Imports and configs
    %%import common.INT -> INT
    %%ignore WHITESPACE
''' % (unit_keys,))


def parse_search_and_filter(term, qs, user):
    """
    TODO: Re-work this as a depth-first recursive processor so we can support
    arbitrarily nested queries ...for fun.
    """
    try:
        tree = grammar.parse(term)
        return qs.filter(parse_tree(tree, user))
    except Exception as e:
        return qs.none()


def parse_token(token):
    if token.type in ('COMBINER', 'SEARCH_TERM'):
        return ('%s' % token).strip('"')
    if token.type in ('ATTR', 'NUM_ATTR'):
        return ALIASES.get('%s' % token, '%s' % token)
    if token.type == 'NUMBER':
        if "/" in token:
            [num, den] = token.split("/")
            return float(num) / float(den)
        return float(token)
    if token.type == 'UNIT':
        return ('%s' % token).lower()
    if token.type == 'OPERATOR':
        return OPS['%s' % token]
    raise NotImplemented


def related_ingredients(ingredients):
    subs = Ingredient.objects.filter(substitutions__in=ingredients)
    rsubs = Ingredient.objects.filter(
        id__in=ingredients.values('substitutions')
    )
    rsubsplusone = Ingredient.objects.filter(substitutions__in=rsubs)

    # Load the ids into memory, since we run into operational errors
    # without evaluating at this point
    return [
        i for i in
        ingredients.union(
            subs, rsubs, rsubsplusone
        ).values_list('id', flat=True)
    ]


def parse_tree(tree, user):
    if tree.__class__ == Token:
        return parse_token(tree)

    data = [parse_tree(t, user) for t in tree.children]

    if tree.data in ('start', 'query', 'nested', 'parens'):
        return data[0]

    if tree.data == 'search_term':
        rgx = '\\b%s\\b' % data[0]
        return Q(quantity__ingredient__name__iregex=rgx) | \
            Q(name__icontains=data[0]) | \
            Q(description__iregex=rgx) | \
            Q(directions__iregex=rgx)

    if tree.data == 'attr_constraint':
        [attr, op, amount] = data
        kwargs = {}
        kwargs['%s__%s' % (attr, op)] = amount
        return Q(**kwargs)

    if tree.data == 'list_constraint':
        term = data[0]
        if term.isdigit():
            return Q(userlist__id=term)
        return Q(userlist__name__icontains=term, userlist__user=user)

    if tree.data == 'book_constraint':
        term = data[0]
        if term.isdigit():
            return Q(book_id=int(term))
        return Q(book__name__icontains=term)

    if tree.data == 'tags_constraint':
        tags = [t.strip() for t in data[0].split(',')]
        qs = Recipe.objects
        for tag in tags:
            qs = qs.filter(tags__name=tag)
        return Q(id__in=qs.values('id'))

    if tree.data == 'constraint':
        if len(tree.children) == 4:
            [search, op, amount, unit] = data
        else:
            [search, op, amount] = data
            unit = 'oz'
        kwargs = {
            'quantity__ingredient__name__icontains': search,
            'quantity__unit': unit
        }
        kwargs['quantity__amount__%s' % op] = amount
        return Q(**kwargs)

    if tree.data == 'attr_search':
        [attr, value] = data
        kwargs = {}
        kwargs['%s__icontains' % attr] = value
        return Q(**kwargs)

    if tree.data == 'combined':
        if data[1] == 'AND':
            qs = Recipe.objects.filter(data[0]).filter(data[2])
            return Q(id__in=qs.values('id'))
        return data[0] | data[2]

    if tree.data == 'exclude':
        return ~data[0]

    if tree.data == 'like':
        # Find the recipes from the nested constraint
        recipes = Recipe.objects.filter(data[0])
        ingred = Ingredient.objects.filter(
            id__in=recipes.values('quantity__ingredient__id'))
        similar_ingredients = related_ingredients(ingred)

        # Find all the quantities that are "oz" based and aren't for one of
        # the related ingredients, and exclude those from the search
        lacking = Quantity.objects \
            .filter(unit__name__in=('oz', 'teaspoon', 'barspoon')) \
            .exclude(ingredient__in=similar_ingredients)
        return ~Q(quantity__in=lacking) & ~Q(id__in=recipes.values('id'))

    if tree.data == 'cabinet':
        # Build out the user cabinet with substitutions in two directions
        user_ingredients = Ingredient.objects.filter(
            id__in=UserIngredient.objects.filter(
                user=user
            ).values('ingredient')
        )
        cabinet = related_ingredients(user_ingredients)

        # Find all the quantities that require an ingredient the user
        # doesn't have, and get all the recipes that don't have one of those
        lacking = Quantity.objects.exclude(ingredient__in=cabinet)
        return ~Q(quantity__in=lacking)

    raise NotImplemented
