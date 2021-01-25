from django.db.models import Count
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework.permissions import IsAuthenticated

from drinks.models import Ingredient
from drinks.serializers import IngredientSerializer
from drinks.views.base import LazyViewSet


class IngredientViewSet(LazyViewSet):
    audit_field = 'created'
    http_method_names = ['get', 'head']
    permission_classes = (IsAuthenticated,)
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer

    # Cache requested url for 2 hours. This is our longest query, so it seems
    # wise to go ahead and cache it, since updates are reasonably rare
    @method_decorator(cache_page(60 * 60 * 2))
    def list(self, request, format=None):
        return super(IngredientViewSet, self).list(request, format)

    def get_queryset(self):
        qs = super(IngredientViewSet, self).get_queryset()
        qs = qs.annotate(usage=Count('quantity'))
        return qs.order_by('-usage')
