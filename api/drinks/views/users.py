from rest_framework.permissions import IsAuthenticated, BasePermission, \
    SAFE_METHODS
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.status import HTTP_400_BAD_REQUEST
from django.shortcuts import get_object_or_404
from django.db.models import Count

from django.contrib.auth.models import User
from drinks.serializers import UserSerializer, NestedIngredientSerializer, \
    PasswordSerializer
from drinks.views.base import LazyViewSet


class UserPermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in SAFE_METHODS:
            return True
        return obj.id == request.user.id


class UserViewSet(ModelViewSet):
    http_method_names = ['get', 'put', 'head']
    permission_classes = (IsAuthenticated, UserPermission)
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

    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        user = self.get_object()
        serializer = PasswordSerializer(data=request.data)
        if serializer.is_valid():
            user.set_password(serializer.data['password'])
            user.save()
            return Response({'status': 'password set'})
        else:
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['put'])
    def cabinet(self, request, pk=None):
        user = self.get_object()
        serializer = NestedIngredientSerializer(many=True, data=request.data)
        if serializer.is_valid():
            user.ingredient_set.set(serializer.data)
            return Response({'status': 'cabinet updated'})
        else:
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)
