from rest_framework.permissions import IsAuthenticated

from drinks.models import Uom
from drinks.serializers import UomSerializer
from drinks.views.base import LazyViewSet


class UomViewSet(LazyViewSet):
    http_method_names = ['get', 'head']
    queryset = Uom.objects.all().order_by('name')
    serializer_class = UomSerializer
