from rest_framework.permissions import IsAuthenticated
from django.db.models import Count

from drinks.models import UserList, UserListRecipe
from drinks.serializers import UserListSerializer, UserListRecipeSerializer
from drinks.permissions import ObjectOwnerPermissions
from drinks.views.base import LazyViewSet


class UserListRecipeViewSet(LazyViewSet):
    permission_classes = (IsAuthenticated, ObjectOwnerPermissions)
    queryset = UserListRecipe.objects.all().order_by('-created')
    serializer_class = UserListRecipeSerializer
    filter_fields = {
        'user_list': ['exact']
    }


class UserListViewSet(LazyViewSet):
    permission_classes = (IsAuthenticated, ObjectOwnerPermissions)
    queryset = UserList.objects.all().order_by('-created')
    serializer_class = UserListSerializer
    filter_fields = {
        'user': ['exact'],
    }

    def get_queryset(self):
        qs = super(UserListViewSet, self).get_queryset()
        return qs.annotate(recipe_count=Count('recipes', distinct=True))
