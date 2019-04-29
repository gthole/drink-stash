from hashlib import md5
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework.serializers import ModelSerializer, BaseSerializer, \
    SerializerMethodField, BooleanField, IntegerField, CharField, \
    ValidationError, Serializer
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
    user_hash = SerializerMethodField(read_only=True)
    is_staff = BooleanField(read_only=True)
    recipe_count = IntegerField(read_only=True)
    comment_count = IntegerField(read_only=True)
    username = CharField(read_only=True)

    def get_user_hash(self, user):
        m = md5()
        m.update(user.email.encode())
        return m.hexdigest()

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'user_hash',
            'first_name',
            'last_name',
            'ingredient_set',
            'is_staff',
            'comment_count',
            'recipe_count',
        )


class NestedUserSerializer(UserSerializer):
    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'user_hash',
            'first_name',
            'last_name',
        )


class PasswordSerializer(Serializer):
    current_password = CharField()
    new_password = CharField()
