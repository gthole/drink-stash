from rest_framework.permissions import BasePermission, SAFE_METHODS, \
    IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from drinks.models import Activity
from drinks.serializers import ActivitySerializer
from drinks.views.base import LazyViewSet


class SmallPagePagination(PageNumberPagination):
    page_size = 50
    page_query_param = 'page'
    page_size_query_param = 'per_page'
    max_page_size = 100


class ActivityPermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return False


class ActivityViewSet(LazyViewSet):
    audit_field = 'created'
    permission_classes = (IsAuthenticated, ActivityPermission)
    pagination_class = SmallPagePagination
    queryset = Activity.objects.all().order_by('-created')
    serializer_class = ActivitySerializer
    filter_fields = {
        'recipe': ['exact'],
        'user': ['exact'],
        'created': ['gte', 'gt', 'lt'],
    }

    def get_queryset(self):
        queryset = super(ActivityViewSet, self).get_queryset()
        permissions = Q(recipe__book__public=True) | \
                      Q(recipe__book__users=self.request.user)
        queryset = queryset.filter(permissions).distinct()
        # Don't fetch recipe activity for recipe details
        # Decide if we want to user a different queryset in this case to
        # ensure we get all of the userlistrecipes that are batched together
        if self.request.GET.get('recipe'):
            queryset = queryset.exclude(type='recipe')
        # Set up eager loading to avoid N+1 selects
        if self.request.method == 'GET':
            queryset = self.get_serializer_class().setup_eager_loading(queryset)
        return queryset
