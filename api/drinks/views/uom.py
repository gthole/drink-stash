from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework.permissions import IsAuthenticated

from drinks.models import Uom
from drinks.serializers import UomSerializer
from drinks.views.base import LazyViewSet


class UomViewSet(LazyViewSet):
    audit_field = 'created'
    http_method_names = ['get', 'head']
    queryset = Uom.objects.all().order_by('name')
    serializer_class = UomSerializer

    # Cache requested url for 2 hours
    @method_decorator(cache_page(60 * 60 * 2))
    def list(self, request, format=None):
        return super(UomViewSet, self).list(request, format)
