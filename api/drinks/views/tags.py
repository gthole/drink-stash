from rest_framework.permissions import IsAuthenticated

from drinks.models import Tag
from drinks.serializers import TagSerializer
from drinks.views.base import LazyViewSet


class TagViewSet(LazyViewSet):
    http_method_names = ['get', 'head']
    queryset = Tag.objects.all().order_by('name')
    serializer_class = TagSerializer
