from rest_framework.serializers import ModelSerializer, IntegerField, \
    FloatField, CreateOnlyDefault, CurrentUserDefault
from django.shortcuts import get_object_or_404
from drinks.models import UserList, UserListRecipe
from .recipes import NestedRecipeListSerializer, \
    ShorterNestedRecipeListSerializer
from .users import NestedUserSerializer


class NestedUserListSerializer(ModelSerializer):
    class Meta:
       model = UserList
       fields = (
           'id',
           'name',
       )

    def to_internal_value(self, data):
        return get_object_or_404(UserList, pk=data)


class UserListRecipeSerializer(ModelSerializer):
    recipe = ShorterNestedRecipeListSerializer()
    user = NestedUserSerializer(source='user_list.user', read_only=True)
    user_list = NestedUserListSerializer()

    class Meta:
        model = UserListRecipe
        fields = (
            'id',
            'recipe',
            'created',
            'user_list',
            'user',
            'notes',
            'order',
        )


class UserListSerializer(ModelSerializer):
    recipe_count = IntegerField(read_only=True)
    user = NestedUserSerializer(
        read_only=True,
        default=CreateOnlyDefault(CurrentUserDefault()),
    )

    class Meta:
        model = UserList
        fields = (
            'id',
            'created',
            'updated',
            'user',
            'name',
            'description',
            'recipe_count',
        )
