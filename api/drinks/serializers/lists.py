from rest_framework.serializers import ModelSerializer, CurrentUserDefault, \
    IntegerField, FloatField
from drinks.models import UserList, UserListRecipe
from .recipes import NestedRecipeListSerializer
from .users import NestedUserSerializer


class UserListRecipeSerializer(ModelSerializer):
    recipe = NestedRecipeListSerializer(read_only=True)

    class Meta:
        model = UserListRecipe
        fields = (
            'id',
            'recipe',
            'notes',
            'order',
        )


class UserListSerializer(ModelSerializer):
    # recipes = NestedUserListRecipeSerializer(read_only=True, many=True)
    recipe_count = IntegerField(read_only=True)
    user = NestedUserSerializer(
        read_only=True,
        default=CurrentUserDefault()
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
