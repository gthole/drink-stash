from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Count

from drinks.models import Recipe, Quantity, Ingredient, UserIngredient
from drinks.serializers import RecipeSerializer, RecipeListSerializer
from drinks.permissions import ObjectOwnerPermissions
from drinks.grammar import parse_search_and_filter
from .base import LazyViewSet


class RecipeViewSet(LazyViewSet):
    permission_classes = (IsAuthenticated, ObjectOwnerPermissions)
    queryset = Recipe.objects.all().order_by('name')
    serializer_class = RecipeSerializer
    list_serializer_class = RecipeListSerializer

    filter_fields = {
        'id': ['in']
    }

    def get_queryset(self):
        queryset = super(RecipeViewSet, self).get_queryset()
        # Set up eager loading to avoid N+1 selects
        queryset = self.get_serializer_class().setup_eager_loading(queryset)
        queryset = queryset.annotate(comment_count=Count('comments', distinct=True))
        return queryset

    def get_serializer_class(self):
        if self.request.path == '/api/v1/recipes/' and self.request.method == 'GET':
            return self.list_serializer_class
        return self.serializer_class

    def filter_queryset(self, *args, **kwargs):
        qs = super().filter_queryset(*args, **kwargs)

        # Searching names and ingredients
        if self.request.GET.get('search'):
            terms = self.request.GET.getlist('search')
            for term in terms:
                qs = parse_search_and_filter(term, qs, self.request.user)
            qs = qs.distinct()

        return qs

    def get_object(self):
        """
        Get recipe by slug or PK
        """
        queryset = self.get_queryset()
        filter = {}

        pk = self.kwargs['pk']
        if pk.isdigit():
            filter['pk'] = pk
        else:
            filter['slug'] = pk

        obj = get_object_or_404(queryset, **filter)
        self.check_object_permissions(self.request, obj)
        return obj
