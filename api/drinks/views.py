from rest_framework.viewsets import ModelViewSet
from django.views.decorators.csrf import ensure_csrf_cookie
from django.shortcuts import render

from django.contrib.auth.models import User
from .models import Recipe, Ingredient
from .serializers import RecipeSerializer, UserSerializer, IngredientSerializer


class RecipeViewSet(ModelViewSet):
    queryset = Recipe.objects.all().order_by('id')
    serializer_class = RecipeSerializer
    filter_fields = (
        'name',
    )

    def get_queryset(self):
        queryset = Recipe.objects.all()
        # Set up eager loading to avoid N+1 selects
        queryset = self.get_serializer_class().setup_eager_loading(queryset)
        return queryset


class IngredientViewSet(ModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer


class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


@ensure_csrf_cookie
def index(request):
    return render(request, 'index.html')
