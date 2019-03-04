from lark import Lark
from .models import Quantity
from django.db.models import Q


UNITS = dict([(v,k) for k, v in Quantity._meta.get_field('unit').choices])
OPS = {
    '>': 'gt',
    '=': 'exact',
    '<': 'lt',
    '>=': 'gte',
    '<=': 'lte'
}
unit_keys = '"i|"'.join([k for k in UNITS.keys() if k])

grammar = Lark('''
    // Top level grammar rules
    query: SEARCH_TERM OPERATOR NUMBER [UNIT] -> constraint
          | SEARCH_TERM -> search_term
          | ATTR "=" SEARCH_TERM -> attr_search
          | "NOT" SEARCH_TERM -> exclude

    // Tokens
    COMBINER: ("AND" | "OR")
    ATTR.2: ("name" | "description" | "directions")
    SEARCH_TERM: /((?!AND|OR|NOT)\w)+(\s((?!AND|OR|NOT)\w)+)*/
    OPERATOR: ("<="|">="|"="|"<"|">")
    UNIT: ("%s"i)
    WHITESPACE: (" " | "\\n")+
    NUMBER: (INT+["."INT+] | "."INT+)

    // Imports and configs
    %%import common.INT -> INT
    %%ignore WHITESPACE
''' % (unit_keys,) , start='query')


def parse_search_and_filter(term, qs):
    try:
        tree = grammar.parse(term)
    except:
        return qs.none()

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

    if tree.data == 'constraint':
        search = '%s' % tree.children[0]
        op = OPS['%s' % tree.children[1]]
        amount = float(tree.children[2])
        if len(tree.children) == 4:
            unit = UNITS[tree.children[3].lower()]
        else:
            unit = 1
        kwargs = {
            'quantity__ingredient__name__icontains': search,
            'quantity__unit': unit
        }
        kwargs['quantity__amount__%s' % op] = amount

        return qs.filter(**kwargs)

    if tree.data == 'attr_search':
        kwargs = {}
        kwargs['%s__icontains' % tree.children[0]] = '%s' % tree.children[1]
        return qs.filter(**kwargs)

    return qs.none()
