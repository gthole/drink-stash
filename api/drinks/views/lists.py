from rest_framework.permissions import IsAuthenticated, BasePermission, \
    SAFE_METHODS
from django.db.models import Count, Q
from django.contrib.auth.models import User

from drinks.models import UserList, UserListRecipe, Recipe
from drinks.serializers import UserListSerializer, UserListRecipeSerializer
from drinks.views.base import LazyViewSet, BookPermission


class UserListRecipePermission(BookPermission):
    def get_book_from_body(self, data):
        recipe_id = data.get('recipe')
        return Recipe.objects.get(pk=recipe_id).book_id

    def get_book_from_obj(self, obj):
        return obj.recipe.book_id

    def check_user_object(self, obj, user):
        # User list recipes can only be modified by their user
        return obj.user_list.user_id == user.id


class UserListRecipeViewSet(LazyViewSet):
    http_method_names = ['get', 'head', 'post', 'delete']
    permission_classes = (IsAuthenticated, UserListRecipePermission)
    queryset = UserListRecipe.objects.all().order_by('-created')
    serializer_class = UserListRecipeSerializer
    filter_fields = ('user_list', 'recipe', 'user_list__user')

    def get_queryset(self):
        qs = super(UserListRecipeViewSet, self).get_queryset()
        permissions = Q(recipe__book__public=True) | \
                      Q(recipe__book__users=self.request.user)
        return qs.filter(permissions).distinct()


class UserListPermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in SAFE_METHODS:
            return True
        return obj.user_id == request.user.id


class UserListViewSet(LazyViewSet):
    permission_classes = (IsAuthenticated, UserListPermission)
    queryset = UserList.objects.all().order_by('-created')
    serializer_class = UserListSerializer
    filter_fields = ('user',)

    def get_queryset(self):
        qs = super(UserListViewSet, self).get_queryset()
        return qs.annotate(recipe_count=Count('recipes', distinct=True))

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
