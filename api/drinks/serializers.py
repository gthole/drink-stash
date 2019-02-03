from rest_framework.serializers import ModelSerializer, ValidationError, \
    BaseSerializer, PrimaryKeyRelatedField, CurrentUserDefault, \
    SerializerMethodField, IntegerField

from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from .models import Recipe, Quantity, Ingredient, UserIngredient, Comment
from .constants import base_substitutions

import hashlib
import sys
sys.stdout = sys.stderr


def get_or_create_ingredient(name):
    try:
        ingredient = Ingredient.objects.get(
            name__iexact=name.lower().strip()
        )
    except:
        ingredient = Ingredient(name=name)
        ingredient.guess_category()  # Don't have quantity info for context here
        ingredient.save()

        if name not in base_substitutions.values():
            ingredient.guess_substitutions()
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
        fields = ('name', 'substitutions', 'category')


class QuantitySerializer(ModelSerializer):
    ingredient = NestedIngredientSerializer()

    class Meta:
        model = Quantity
        fields = ('id', 'amount', 'unit', 'ingredient', 'hidden')


class NestedUserSerializer(ModelSerializer):
    user_hash = SerializerMethodField(read_only=True)

    def get_user_hash(self, user):
        m = hashlib.md5()
        m.update(user.email.encode())
        return m.hexdigest()

    class Meta:
        model = User
        fields = (
            'id',
            'user_hash',
            'first_name',
            'last_name',
        )


class QuantityIngredientSerializer(BaseSerializer):
    def to_representation(self, obj):
        return obj.ingredient.name


class RecipeListSerializer(ModelSerializer):
    """
    Main GET LIST Serializer for Recipes without all the details
    """
    comment_count = IntegerField()
    ingredients = QuantityIngredientSerializer(
        source='quantity_set',
        many=True,
        read_only=True
    )
    added_by = NestedUserSerializer(read_only=True)

    class Meta:
       model = Recipe
       fields = (
           'id',
           'name',
           'created',
           'added_by',
           'ingredients',
           'comment_count',
       )

    @staticmethod
    def setup_eager_loading(queryset):
        "Perform necessary eager loading of data."
        queryset = queryset.select_related('added_by')
        queryset = queryset.prefetch_related(
            'quantity_set',
            'quantity_set__ingredient'
        )

        return queryset


class NestedRecipeListSerializer(RecipeListSerializer):
    """
    Used by CommentSerializer to get Recipes without comment_count
    """
    class Meta:
       model = Recipe
       fields = (
           'id',
           'name',
           'created',
           'added_by',
           'ingredients',
       )

    def to_internal_value(self, data):
        return get_object_or_404(Recipe, pk=data)


class RecipeSerializer(RecipeListSerializer):
    """
    Recipe details plus POST/PUT processing
    """
    quantity_set = QuantitySerializer(many=True)

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
            'comment_count',
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
        recipe.save()

        recipe.quantity_set.all().delete()
        return self.add_quantities(recipe, quantity_data)


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
            'rating',
            'text',
            'updated',
            'created',
        )

    @staticmethod
    def setup_eager_loading(queryset):
        "Perform necessary eager loading of data."
        queryset = queryset.select_related('recipe', 'recipe__added_by')
        queryset = queryset.prefetch_related(
            'recipe__quantity_set',
            'recipe__quantity_set__ingredient'
        )

        return queryset


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
            'is_staff',
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
