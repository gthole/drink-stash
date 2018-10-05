from rest_framework.serializers import ModelSerializer, ValidationError, BaseSerializer

from .models import Recipe, Quantity, Ingredient

import sys
sys.stdout = sys.stderr


class NestedIngredientSerializer(BaseSerializer):
    def to_internal_value(self, data):
        try:
            ingredient = Ingredient.objects.get(
                name__iexact=data.lower().strip()
            )
        except:
            ingredient = Ingredient(name=data)
            ingredient.save()
        return ingredient

    def to_representation(self, obj):
        return obj.name


class QuantitySerializer(ModelSerializer):
    ingredient = NestedIngredientSerializer()

    class Meta:
        model = Quantity
        fields = ('id', 'amount', 'unit', 'ingredient')


class RecipeSerializer(ModelSerializer):
    quantity_set = QuantitySerializer(many=True)

    class Meta:
        model = Recipe
        fields = (
            'id',
            'name',
            'source',
            'directions',
            'description',
            'notes',
            'quantity_set',
        )

    def add_quantities(self, recipe, quantity_data):
        for qdata in quantity_data:
            Quantity(recipe=recipe, **qdata).save()
        return recipe

    def create(self, validated_data):
        quantity_data = validated_data.pop('quantity_set')
        recipe = Recipe.objects.create(**validated_data)
        return self.add_quantities(recipe, quantity_data)

    def update(self, recipe, validated_data):
        quantity_data = validated_data.pop('quantity_set')

        # Update base fields
        recipe.name = validated_data.get('name', recipe.name)
        recipe.source = validated_data.get('source', recipe.source)
        recipe.directions = validated_data.get('directions', recipe.directions)
        recipe.description = validated_data.get('description', recipe.description)
        recipe.notes = validated_data.get('notes', recipe.notes)
        recipe.save()

        recipe.quantity_set.all().delete()
        return self.add_quantities(recipe, quantity_data)
