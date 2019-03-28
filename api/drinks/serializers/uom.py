from rest_framework.serializers import BaseSerializer
from django.shortcuts import get_object_or_404
from drinks.models import Uom


class UomSerializer(BaseSerializer):
    def to_internal_value(self, data):
        return get_object_or_404(Uom, name=data)

    def to_representation(self, obj):
        return obj.name
