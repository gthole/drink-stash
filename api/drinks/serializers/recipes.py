from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework.serializers import ModelSerializer, BaseSerializer, \
    CurrentUserDefault, IntegerField, CharField, ValidationError
from .users import NestedUserSerializer
from .tags import TagSerializer
from .ingredients import NestedIngredientSerializer
from drinks.models import Recipe, Quantity, Uom


class QuantityIngredientSerializer(BaseSerializer):
    def to_representation(self, obj):
        return obj.ingredient.name


class RecipeListSerializer(ModelSerializer):
    """
    Main GET LIST Serializer for Recipes without all the details
    """
    comment_count = IntegerField(read_only=True)
    ingredients = QuantityIngredientSerializer(
        source='quantity_set',
        many=True,
        read_only=True
    )
    slug = CharField(read_only=True)
    tags = TagSerializer(many=True)
    added_by = NestedUserSerializer(
        read_only=True,
        default=CurrentUserDefault()
    )

    class Meta:
       model = Recipe
       fields = (
           'id',
           'slug',
           'name',
           'created',
           'added_by',
           'ingredients',
           'comment_count',
           'tags',
       )

    @staticmethod
    def setup_eager_loading(queryset):
        "Perform necessary eager loading of data."
        queryset = queryset.select_related('added_by')
        queryset = queryset.prefetch_related(
            'tags',
            'quantity_set',
            'quantity_set__ingredient'
        )

        return queryset


#
# Used by Comments, UserLists
#


class NestedRecipeListSerializer(RecipeListSerializer):
    class Meta:
       model = Recipe
       fields = (
           'id',
           'slug',
           'name',
           'created',
           'added_by',
           'ingredients',
       )

    def to_internal_value(self, data):
        return get_object_or_404(Recipe, pk=data)


class ShorterNestedRecipeListSerializer(NestedRecipeListSerializer):
    class Meta:
       model = Recipe
       fields = (
           'slug',
           'name',
           'ingredients',
       )


#
# Details & PUT/POST
#


class QuantitySerializer(ModelSerializer):
    ingredient = NestedIngredientSerializer()
    unit = CharField(allow_blank=True)

    class Meta:
        model = Quantity
        fields = ('amount', 'unit', 'ingredient', 'hidden')

    def validate_unit(self, data):
        "Custom validation here to allow the empty string unit"
        try:
            return get_object_or_404(Uom, name=data)
        except Http404:
            raise ValidationError('Unknown unit of measure')


class RecipeSerializer(RecipeListSerializer):
    """
    Recipe details plus POST/PUT processing
    """
    quantity_set = QuantitySerializer(many=True)

    class Meta:
        model = Recipe
        fields = (
            'id',
            'slug',
            'name',
            'source',
            'directions',
            'description',
            'quantity_set',
            'created',
            'added_by',
            'tags',
            'comment_count',
        )

    def validate(self, data):
        """
        Must have at least two quantities to make a drink
        """
        if len(data['quantity_set']) <= 1:
            raise ValidationError('Must have at least two quantities per '
                                  'mixed drink')
        return data

    def add_quantities(self, recipe, quantity_data):
        for qdata in quantity_data:
            Quantity(recipe=recipe, **qdata).save()
        return recipe

    def create(self, validated_data):
        quantity_data = validated_data.pop('quantity_set')
        tags = validated_data.pop('tags')
        recipe = Recipe.objects.create(**validated_data)
        recipe.tags.set(tags)
        return self.add_quantities(recipe, quantity_data)

    def update(self, recipe, validated_data):
        quantity_data = validated_data.pop('quantity_set')
        tags = validated_data.pop('tags')

        # Update base fields
        recipe.name = validated_data.get('name', recipe.name)
        recipe.source = validated_data.get('source', recipe.source)
        recipe.directions = validated_data.get('directions', recipe.directions)
        recipe.description = validated_data.get('description', recipe.description)
        recipe.save()

        recipe.tags.set(tags)
        recipe.quantity_set.all().delete()
        return self.add_quantities(recipe, quantity_data)
