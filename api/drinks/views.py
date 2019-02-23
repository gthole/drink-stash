from rest_framework.viewsets import ModelViewSet
from rest_framework.exceptions import APIException
from django.views.decorators.csrf import ensure_csrf_cookie
from django.shortcuts import render

from django.db.models import Q, Count, OuterRef, Exists
from django.contrib.auth.models import User
from .models import Recipe, Ingredient, Comment, Quantity, UserIngredient, \
    UserFavorite
from .serializers import RecipeSerializer, RecipeListSerializer, \
    UserSerializer, IngredientSerializer, CommentSerializer, \
    UserFavoriteSerializer
from dateutil import parser as date_parser
from lark import Lark


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
UNIT: ("oz"i|"dash"i|"barspoon"i|"leaf"i|"wedge"i|"sprig"i)
WHITESPACE: (" " | "\\n")+
NUMBER: (INT+["."INT+] | "."INT+)

// Imports and configs
%import common.INT -> INT
%ignore WHITESPACE
''', start='query')


UNITS = dict([(v,k) for k, v in Quantity._meta.get_field('unit').choices])

OPS = {
    '>': 'gt',
    '=': 'exact',
    '<': 'lt',
    '>=': 'gte',
    '<=': 'lte'
}


class NotModified(APIException):
    status_code = 304
    default_detail = None


class LazyViewSet(ModelViewSet):
    def get_queryset(self):
        modified = self.request.META.get('HTTP_IF_MODIFIED_SINCE')
        if modified:
            parsed = date_parser.parse(modified)
            if self.queryset.only('created').latest('created').created <= parsed:
                raise NotModified
        return self.queryset


class RecipeViewSet(LazyViewSet):
    queryset = Recipe.objects.all().order_by('name')
    serializer_class = RecipeSerializer
    list_serializer_class = RecipeListSerializer

    def get_queryset(self):
        queryset = super(RecipeViewSet, self).get_queryset()
        # Set up eager loading to avoid N+1 selects
        queryset = self.get_serializer_class().setup_eager_loading(queryset)
        return queryset

    def get_serializer_class(self):
        if self.request.path == '/api/v1/recipes/' and self.request.method == 'GET':
            return self.list_serializer_class
        return self.serializer_class

    def filter_queryset(self, *args, **kwargs):
        qs = super().filter_queryset(*args, **kwargs)
        qs = qs.annotate(comment_count=Count('comments'))
        qs = qs.annotate(favorite_count=Count('favorites'))
        has_favorite = UserFavorite.objects.filter(
            recipe=OuterRef('pk'),
            user=self.request.user
        )
        qs = qs.annotate(favorite=Exists(has_favorite))

        # Whether there are comments or not
        if self.request.GET.get('comments') == 'true':
            qs = self.filter_by_comments(qs)

        # Whether the user has favorited
        if self.request.GET.get('favorites') == 'true':
            qs = self.filter_by_favorites(qs)

        # User ingredient cabinet
        if self.request.GET.get('cabinet') == 'true':
            qs = self.filter_by_cabinet(qs)

        # Searching names and ingredients
        if self.request.GET.get('search'):
            try:
                qs = self.filter_by_search_terms(qs)
            except Exception as e:
                print(e)
                qs = qs.none()

        return qs

    def filter_by_comments(self, qs):
        return qs.filter(comment_count__gt=0)

    def filter_by_favorites(self, qs):
        return qs.filter(favorite=True)

    def filter_by_cabinet(self, qs):
        # Build out the user cabinet with substitutions in two directions
        user_ingredients = Ingredient.objects.filter(
            id__in=UserIngredient.objects.filter(
                user=self.request.user
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

    def filter_by_search_terms(self, qs):
        terms = self.request.GET.get('search').split(',')
        for term in terms:
            tree = grammar.parse(term)
            qs = self.build_query_from_tree(tree, qs)
        return qs.distinct()

    def build_query_from_tree(self, tree, qs):
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



class IngredientViewSet(LazyViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer

    def get_queryset(self):
        qs = super(IngredientViewSet, self).get_queryset()
        qs = qs.annotate(usage=Count('quantity'))
        return qs.order_by('name')


class CommentViewSet(LazyViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    filter_fields = {
        'recipe': ['exact'],
        'user': ['exact'],
    }

    def get_queryset(self):
        queryset = super(CommentViewSet, self).get_queryset()
        # Set up eager loading to avoid N+1 selects
        if self.request.method == 'GET':
            queryset = self.get_serializer_class().setup_eager_loading(queryset)
        return queryset

    def filter_queryset(self, *args, **kwargs):
        "Custom filtering to for exclude negations of users"
        qs = super().filter_queryset(*args, **kwargs)
        if self.request.GET.get('user!'):
            qs = qs.exclude(user__id=self.request.GET.get('user!'))
        return qs


class UserFavoriteViewSet(LazyViewSet):
    queryset = UserFavorite.objects.all()
    serializer_class = UserFavoriteSerializer
    filter_fields = {
        'recipe': ['exact'],
    }


class UserViewSet(LazyViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


@ensure_csrf_cookie
def index(request):
    return render(request, 'index.html')
