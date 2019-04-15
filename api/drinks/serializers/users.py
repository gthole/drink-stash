from hashlib import md5
from django.contrib.auth.models import User
from rest_framework.serializers import ModelSerializer, BaseSerializer, \
    SerializerMethodField, BooleanField, IntegerField
from drinks.models import UserIngredient
from .ingredients import get_or_create_ingredient


class UserIngredientSerializer(BaseSerializer):
    def to_internal_value(self, data):
        return data

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


class PasswordSerializer(BaseSerializer):
    current_password = CharField()
    new_password = CharField()
