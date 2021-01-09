from hashlib import md5
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework.serializers import ModelSerializer, BaseSerializer, \
    SerializerMethodField, BooleanField, IntegerField, CharField, \
    ValidationError, Serializer, EmailField
from drinks.models import UserIngredient


class UserIngredientSerializer(BaseSerializer):
    def to_internal_value(self, data):
        ingredient = next((i for i in self.context['ingredients']
                           if i.name == data), None)
        if ingredient is None:
            raise ValidationError(detail='Unknown ingredient')

        try:
            return next((ui for ui in self.context['user_ingredients']
                         if ui.ingredient.name == data))
        except StopIteration:
            return UserIngredient(
                user=self.context['request'].user,
                ingredient=ingredient
            )

    def to_representation(self, obj):
        return obj.ingredient.name


class UserSerializer(ModelSerializer):
    ingredient_set = UserIngredientSerializer(many=True, read_only=True)
    is_staff = BooleanField(read_only=True)
    recipe_count = IntegerField(read_only=True)
    comment_count = IntegerField(read_only=True)
    username = CharField(read_only=True)
    image = CharField(source='profile.profile', read_only=True, default=None)

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'first_name',
            'last_name',
            'ingredient_set',
            'is_staff',
            'comment_count',
            'recipe_count',
            'image',
        )


class SelfUserSerializer(UserSerializer):
    email = EmailField()
    display_mode = CharField(source='profile.display_mode', default='system')

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'ingredient_set',
            'is_staff',
            'comment_count',
            'recipe_count',
            'image',
            'display_mode',
        )

    def update(self, user, validated_data):
        user.profile.display_mode = validated_data['profile']['display_mode']
        user.profile.save()

        user.email = validated_data['email']
        user.first_name = validated_data['first_name']
        user.last_name = validated_data['last_name']
        user.save()

        return user


class NestedUserSerializer(UserSerializer):
    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'first_name',
            'last_name',
            'image',
        )
