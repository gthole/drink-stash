from rest_framework.serializers import ModelSerializer, BaseSerializer, \
    IntegerField
from drinks.models import Ingredient


def get_or_create_ingredient(name):
    try:
        ingredient = Ingredient.objects.get(
            name__iexact=name.lower().strip()
        )
    except:
        ingredient = Ingredient(name=name)
        ingredient.save()
        ingredient.guess_category()  # Don't have quantity info for context here
    return ingredient


class NestedIngredientSerializer(BaseSerializer):
    def to_internal_value(self, data):
        return get_or_create_ingredient(data)

    def to_representation(self, obj):
        return obj.name


class IngredientSerializer(ModelSerializer):
    substitutions = NestedIngredientSerializer(many=True)
    usage = IntegerField(read_only=True)

    class Meta:
        model = Ingredient
        fields = ('name', 'usage', 'substitutions', 'category')
