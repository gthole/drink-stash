from rest_framework.viewsets import ModelViewSet
from rest_framework.exceptions import APIException
from django.views.decorators.csrf import ensure_csrf_cookie
from django.shortcuts import render

from django.contrib.auth.models import User
from .models import Recipe, Ingredient, Comment
from .serializers import RecipeSerializer, \
    UserSerializer, IngredientSerializer, CommentSerializer
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

    def get_queryset(self):
        queryset = super(RecipeViewSet, self).get_queryset()
        # Set up eager loading to avoid N+1 selects
        queryset = self.get_serializer_class().setup_eager_loading(queryset)
        return queryset


class IngredientViewSet(LazyViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer


class CommentViewSet(LazyViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    ordering_fields = ('id',)
    filter_fields = {
        'recipe': ['exact'],
    }

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
