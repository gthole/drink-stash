from django.db.models import Count
from rest_framework.permissions import IsAuthenticated

from drinks.models import Ingredient
from drinks.serializers import IngredientSerializer
from drinks.permissions import ObjectOwnerPermissions
from drinks.views.base import LazyViewSet


class IngredientViewSet(LazyViewSet):
    http_method_names = ['get', 'head']
    permission_classes = (IsAuthenticated, ObjectOwnerPermissions)
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer

    def get_queryset(self):
        qs = super(IngredientViewSet, self).get_queryset()
        qs = qs.annotate(usage=Count('quantity'))
        return qs.order_by('name')
