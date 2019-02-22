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
            qs = self.filter_by_search_terms(qs)

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
            # Strip whitespace
            term = term.strip()

            # Check for negations
            exclude = False
            if term.startswith('NOT '):
                term = term[4:]
                exclude = True

            qargs = []
            qkwargs = {}
            if '>' in term or '=' in term or '<' in term:
                parsed = self.parse_complex_term(term)
                if not parsed:
                    continue

                # Build the filter from parsed terms
                qkwargs = {
                    'quantity__ingredient__name__icontains': parsed['search'],
                    'quantity__unit': parsed['unit']
                }
                qkwargs['quantity__amount__%s' % parsed['op']] = parsed['amount']
            else:
                # TODO: restrict description regex to terms that match \w+
                qargs = [
                    Q(quantity__ingredient__name__icontains=term) | \
                    Q(name__icontains=term) | \
                    Q(description__iregex='\\b%s\\b' % term)
                ]

            if exclude:
                qs = qs.exclude(*qargs, **qkwargs)
            else:
                qs = qs.filter(*qargs, **qkwargs)

        return qs.distinct()

    def parse_complex_term(self, term):
        # Pick out the operator
        for op in ('<=', '>=', '=', '<', '>'):
            split_terms = term.split(op)
            if len(split_terms) > 1:
                break

        # Grab the search term
        search = split_terms[0].strip()

        # Parse unit, default to "oz"
        unit = 1
        has_unit = False
        for (i, uname) in Quantity._meta.get_field('unit').choices:
            if not uname:
                continue
            if split_terms[1].lower().endswith(uname):
                has_unit = True
                unit = i
                break

        # Get the filter amount, strip off the unit name
        trim = -1 * len(uname) if has_unit else len(split_terms[0])
        try:
            amount = float(split_terms[1][0:trim].strip())
        except ValueError:
            return None

        return {
            'search': search,
            'unit': unit,
            'op': OPS[op],
            'amount': amount
        }


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
