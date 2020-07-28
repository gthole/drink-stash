from rest_framework.serializers import ModelSerializer, CreateOnlyDefault, \
    CurrentUserDefault
from rest_framework.validators import UniqueTogetherValidator
from .users import NestedUserSerializer
from .recipes import ShorterNestedRecipeListSerializer
from .lists import NestedUserListSerializer
from drinks.models import Activity


class ActivitySerializer(ModelSerializer):
    user = NestedUserSerializer()
    recipe = ShorterNestedRecipeListSerializer()
    user_list = NestedUserListSerializer()

    class Meta:
        model = Activity
        fields = (
            'id',
            'created',
            'recipe',
            'user_list',
            'user',
            'body',
            'type',
            'count',
        )

    @staticmethod
    def setup_eager_loading(queryset):
        "Perform necessary eager loading of data."
        queryset = queryset.prefetch_related(
            'recipe',
            'user',
            'user_list',
            'recipe__quantity_set',
            'recipe__quantity_set__ingredient'
        )
        return queryset
