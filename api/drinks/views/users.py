from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.models import User
from drinks.serializers import UserSerializer
from drinks.permissions import ObjectOwnerPermissions
from drinks.views.base import LazyViewSet


class UserViewSet(LazyViewSet):
    http_method_names = ['get', 'put', 'head']
    permission_classes = (IsAuthenticated, ObjectOwnerPermissions)
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer
