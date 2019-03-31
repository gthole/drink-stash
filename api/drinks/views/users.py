from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from django.shortcuts import get_object_or_404
from django.db.models import Count

from django.contrib.auth.models import User
from drinks.serializers import UserSerializer
from drinks.permissions import ObjectOwnerPermissions
from drinks.views.base import LazyViewSet


class UserViewSet(ModelViewSet):
    http_method_names = ['get', 'put', 'head']
    permission_classes = (IsAuthenticated, ObjectOwnerPermissions)
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer

    def get_queryset(self):
        queryset = super(UserViewSet, self).get_queryset()
        queryset = queryset.annotate(comment_count=Count('comments', distinct=True))
        queryset = queryset.annotate(recipe_count=Count('recipe', distinct=True))
        return queryset

    def get_object(self):
        """
        Get user by username or PK
        """
        queryset = self.get_queryset()
        filter = {}

        pk = self.kwargs['pk']
        if pk.isdigit():
            filter['pk'] = pk
        else:
            filter['username'] = pk

        obj = get_object_or_404(queryset, **filter)
        self.check_object_permissions(self.request, obj)
        return obj
