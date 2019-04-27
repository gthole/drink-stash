from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from django.contrib.auth.models import User

from drinks.models import UserList, UserListRecipe, Recipe
from drinks.serializers import UserListSerializer, UserListRecipeSerializer
from drinks.permissions import ObjectOwnerPermissions
from drinks.views.base import LazyViewSet


class UserListRecipeViewSet(LazyViewSet):
    permission_classes = (IsAuthenticated, ObjectOwnerPermissions)
    queryset = UserListRecipe.objects.all().order_by('-created')
    serializer_class = UserListRecipeSerializer
    filter_fields = ('user_list', 'recipe', 'user_list__user')


class UserListViewSet(LazyViewSet):
    permission_classes = (IsAuthenticated, ObjectOwnerPermissions)
    queryset = UserList.objects.all().order_by('-created')
    serializer_class = UserListSerializer
    filter_fields = ('user',)

    def get_queryset(self):
        qs = super(UserListViewSet, self).get_queryset()
        return qs.annotate(recipe_count=Count('recipes', distinct=True))

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
