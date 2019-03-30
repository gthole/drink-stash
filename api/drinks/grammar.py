from lark import Lark
from .models import Quantity, Ingredient, UserIngredient
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
    'favorites': 'favorite_count',
    'desc': 'description',
    'description': 'description',
    'source': 'source',
    'name': 'name',
    'directions': 'directions'
}
unit_keys = '"i|"'.join(UNITS)

grammar = Lark('''
    // Top level grammar rules
    start: attr_constraint | \
           constraint | \
           search_term | \
           attr_search | \
           exclude | \
           cabinet | \
           tags_constraint | \
           list_constraint

    attr_constraint.2: NUM_ATTR OPERATOR NUMBER
    list_constraint.2: "list" "=" SEARCH_TERM
    tags_constraint.2: "tags" "=" SEARCH_TERM
    cabinet: "cabinet" "=" ("true" | "1") | "cabinet"
    constraint: SEARCH_TERM OPERATOR NUMBER [UNIT]
    search_term: SEARCH_TERM
    attr_search: ATTR "=" SEARCH_TERM
    exclude: "NOT" SEARCH_TERM

    // Tokens
    COMBINER: ("AND" | "OR")
    NUM_ATTR.2: ("comments" | "favorites")
    ATTR: ("name" | "description" | "directions" | "source")
    SEARCH_TERM: /((?!AND|OR|NOT)[^<=> ])+(\s((?!AND|OR|NOT)[^<=> ])+)*/
    OPERATOR: ("<="|">="|"="|"<"|">")
    UNIT: ("%s"i)
    WHITESPACE: (" " | "\\n")+
    NUMBER: (INT"/"INT | INT+["."INT+] | "."INT+ )

    // Imports and configs
    %%import common.INT -> INT
    %%ignore WHITESPACE
''' % (unit_keys,))


def parse_number(token):
    if "/" in token:
        [num, den] = token.split("/")
        return float(num) / float(den)
    else:
        return float(token)


def parse_search_and_filter(term, qs, user):
    """
    TODO: Re-work this as a depth-first recursive processor so we can support
    arbitrarily nested queries ...for fun.
    """
    try:
        start_tree = grammar.parse(term)
    except:
        return qs.none()

    tree = start_tree.children[0]

    if tree.data == 'search_term':
        term = '%s' % tree.children[0]
        return qs.filter(
            Q(quantity__ingredient__name__icontains=term) | \
            Q(name__icontains=term) | \
            Q(description__iregex='\\b%s\\b' % term)
        )

    if tree.data == 'exclude':
        term = '%s' % tree.children[0]
        return qs.exclude(
            Q(quantity__ingredient__name__icontains=term) | \
            Q(name__icontains=term) | \
            Q(description__iregex='\\b%s\\b' % term)
        )

    if tree.data == 'attr_constraint':
        attr = ALIASES.get(tree.children[0], tree.children[0])
        op = OPS['%s' % tree.children[1]]
        amount = parse_number(tree.children[2])
        kwargs = {}
        kwargs['%s__%s' % (attr, op)] = amount
        return qs.filter(**kwargs)

    if tree.data == 'list_constraint':
        term = '%s' % tree.children[0]
        return qs.filter(userlist__name__icontains=term, userlist__user=user)

    if tree.data == 'tags_constraint':
        tags = [t.strip() for t in ('%s' % tree.children[0]).split(',')]
        for tag in tags:
            qs = qs.filter(tags__name=tag)
        return qs

    if tree.data == 'constraint':
        search = '%s' % tree.children[0]
        op = OPS['%s' % tree.children[1]]
        amount = parse_number(tree.children[2])

        if len(tree.children) == 4:
            unit = tree.children[3].lower()
        else:
            unit = 1
        kwargs = {
            'quantity__ingredient__name__icontains': search,
            'quantity__unit': unit
        }
        kwargs['quantity__amount__%s' % op] = amount
        return qs.filter(**kwargs)

    if tree.data == 'attr_search':
        attr = ALIASES.get(tree.children[0], tree.children[0])
        kwargs = {}
        kwargs['%s__icontains' % tree.children[0]] = '%s' % tree.children[1]
        return qs.filter(**kwargs)

    if tree.data == 'cabinet':
        # Build out the user cabinet with substitutions in two directions
        user_ingredients = Ingredient.objects.filter(
            id__in=UserIngredient.objects.filter(
                user=user
            ).values('ingredient')
        )
        subs = Ingredient.objects.filter(substitutions__in=user_ingredients)
        rsubs = Ingredient.objects.filter(
            id__in=user_ingredients.values('substitutions')
        )
        rsubsplusone = Ingredient.objects.filter(substitutions__in=rsubs)

        # Load the ids into memory, since we run into operational errors
        # without evaluating at this point
        cabinet = [
            i for i in
            user_ingredients.union(
                subs, rsubs, rsubsplusone
            ).values_list('id', flat=True)
        ]

        # Find all the quantities that require an ingredient the user
        # doesn't have, and get all the recipes that don't have one of those
        lacking = Quantity.objects.exclude(ingredient__in=cabinet)
        return qs.exclude(quantity__in=lacking)

    return qs.none()
