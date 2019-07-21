from django.shortcuts import get_object_or_404
from rest_framework.serializers import ModelSerializer, BaseSerializer, \
    CurrentUserDefault, IntegerField, CharField, ValidationError
from drinks.models import Book


class NestedBookSerializer(ModelSerializer):
    name = CharField(read_only=True)

    class Meta:
        model = Book
        fields = ('id', 'name')

    def to_internal_value(self, data):
        return get_object_or_404(Book, pk=data)


class BookSerializer(ModelSerializer):
    name = CharField(read_only=True)

    class Meta:
        model = Book
        fields = ('id', 'name')
