from rest_framework.serializers import ModelSerializer, CurrentUserDefault
from rest_framework.validators import UniqueTogetherValidator
from .users import NestedUserSerializer
from .recipes import NestedRecipeListSerializer
from drinks.models import Comment


class CommentSerializer(ModelSerializer):
    user = NestedUserSerializer(
        read_only=True,
        default=CurrentUserDefault()
    )
    recipe = NestedRecipeListSerializer()

    class Meta:
        model = Comment
        fields = (
            'id',
            'user',
            'recipe',
            'text',
            'updated',
            'created',
        )
        validators = [
            UniqueTogetherValidator(
                queryset=Comment.objects.all(),
                fields=('user', 'recipe')
            )
        ]

    @staticmethod
    def setup_eager_loading(queryset):
        "Perform necessary eager loading of data."
        queryset = queryset.select_related('recipe', 'recipe__added_by')
        queryset = queryset.prefetch_related(
            'recipe__quantity_set',
            'recipe__quantity_set__ingredient'
        )

        return queryset
