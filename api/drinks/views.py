from rest_framework.viewsets import ModelViewSet
from django.views.decorators.csrf import ensure_csrf_cookie
from django.shortcuts import render

from django.contrib.auth.models import User
from .models import Recipe, Ingredient, Comment
from .serializers import RecipeSerializer, UserSerializer, \
    IngredientSerializer, CommentSerializer


class RecipeViewSet(ModelViewSet):
    queryset = Recipe.objects.all().order_by('id')
    serializer_class = RecipeSerializer

    def get_queryset(self):
        queryset = Recipe.objects.all()
        # Set up eager loading to avoid N+1 selects
        queryset = self.get_serializer_class().setup_eager_loading(queryset)
        return queryset


class IngredientViewSet(ModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer


class CommentViewSet(ModelViewSet):
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

class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


@ensure_csrf_cookie
def index(request):
    return render(request, 'index.html')
