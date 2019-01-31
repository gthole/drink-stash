from rest_framework.viewsets import ModelViewSet
from rest_framework.exceptions import APIException
from django.views.decorators.csrf import ensure_csrf_cookie
from django.shortcuts import render

from django.db.models import Q, Count
from django.contrib.auth.models import User
from .models import Recipe, Ingredient, Comment, Quantity, UserIngredient
from .serializers import RecipeSerializer, RecipeListSerializer, \
    UserSerializer, IngredientSerializer, CommentSerializer, \
    PostCommentSerializer
from dateutil import parser as date_parser


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

        if self.request.GET.get('comments') == 'true':
            qs = qs.filter(comment_count__gt=0)

        if self.request.GET.get('cabinet') == 'true':
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
            qs = qs.exclude(quantity__in=lacking)

        # Searching names and ingredients
        if self.request.GET.get('search'):
            terms = self.request.GET.get('search').split(',')
            for term in terms:
                qs = qs.filter(
                    Q(quantity__ingredient__name__icontains=term) |
                    Q(name__icontains=term)
                )
            qs = qs.distinct()
        return qs


class IngredientViewSet(LazyViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer

    def get_queryset(self):
        return super(IngredientViewSet, self).get_queryset().order_by('name')


class CommentViewSet(LazyViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    post_serializer_class = PostCommentSerializer
    filter_fields = {
        'recipe': ['exact'],
    }

    def get_serializer_class(self):
        if self.request.method in ('POST', 'PUT'):
            return self.post_serializer_class
        return self.serializer_class

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


class UserViewSet(LazyViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


@ensure_csrf_cookie
def index(request):
    return render(request, 'index.html')
