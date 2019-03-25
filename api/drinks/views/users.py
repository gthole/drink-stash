from rest_framework.permissions import IsAuthenticated
from django.db.models import Count

from django.contrib.auth.models import User
from drinks.serializers import UserSerializer
from drinks.permissions import ObjectOwnerPermissions
from drinks.views.base import LazyViewSet


class UserViewSet(LazyViewSet):
    http_method_names = ['get', 'put', 'head']
    permission_classes = (IsAuthenticated, ObjectOwnerPermissions)
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer

    def get_queryset(self):
        queryset = super(UserViewSet, self).get_queryset()
        queryset = queryset.annotate(comment_count=Count('comments', distinct=True))
        queryset = queryset.annotate(recipe_count=Count('recipe', distinct=True))
        return queryset
