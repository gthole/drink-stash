from rest_framework.serializers import ModelSerializer, ValidationError, \
    BaseSerializer, PrimaryKeyRelatedField, CurrentUserDefault

from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from .models import Recipe, Quantity, Ingredient, UserIngredient
from .constants import base_substitutions

import sys
sys.stdout = sys.stderr


def get_or_create_ingredient(name):
    try:
        ingredient = Ingredient.objects.get(
            name__iexact=name.lower().strip()
        )
    except:
        ingredient = Ingredient(name=name)
        ingredient.save()

        if name not in base_substitutions.values():
            # Check for base liquor substitutions to add
            for key, val in base_substitutions.items():
                if name.lower().endswith(' %s' % key):
                    sub = Ingredient.objects.get(name=val)
                    ingredient.substitutions.add(sub)
                    break
    return ingredient


class NestedIngredientSerializer(BaseSerializer):
    def to_internal_value(self, data):
        return get_or_create_ingredient(data)

    def to_representation(self, obj):
        return obj.name


class IngredientSerializer(ModelSerializer):
    substitutions = NestedIngredientSerializer(many=True)
    class Meta:
        model = Ingredient
        fields = ('name', 'substitutions')


class QuantitySerializer(ModelSerializer):
    ingredient = NestedIngredientSerializer()

    class Meta:
        model = Quantity
        fields = ('id', 'amount', 'unit', 'ingredient')


class RecipeSerializer(ModelSerializer):
    quantity_set = QuantitySerializer(many=True)
    added_by = PrimaryKeyRelatedField(
        read_only=True,
        default=CurrentUserDefault()
    )

    class Meta:
        model = Recipe
        fields = (
            'id',
            'name',
            'source',
            'directions',
            'description',
            'quantity_set',
            'created',
            'added_by',
        )

    @staticmethod
    def setup_eager_loading(queryset):
        """ Perform necessary eager loading of data. """
        # select_related for "to-one" relationships
        queryset = queryset.select_related('added_by')

        # prefetch_related for "to-many" relationships
        queryset = queryset.prefetch_related(
            'quantity_set',
            'quantity_set__ingredient'
        )

        return queryset

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


class UserIngredientSerializer(BaseSerializer):
    def to_internal_value(self, data):
        return data

    def to_representation(self, obj):
        return obj.ingredient.name


class UserSerializer(ModelSerializer):
    # TODO: Block unused methods, add permissions check to update
    ingredient_set = UserIngredientSerializer(many=True)

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'first_name',
            'last_name',
            'ingredient_set',
        )

    def add_user_ingredients(self, user, ingredients):
        for ingredient_name in ingredients:
            ingredient = get_or_create_ingredient(ingredient_name)
            UserIngredient(user=user, ingredient=ingredient).save()
        return user

    def update(self, user, validated_data):
        ingredients = [
            ingredient for ingredient in
            validated_data.pop('ingredient_set')
            if ingredient
        ]
        user.ingredient_set.all().delete()
        return self.add_user_ingredients(user, ingredients)
