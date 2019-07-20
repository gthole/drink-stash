from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q

from drinks.models import Recipe, Quantity, Ingredient, UserIngredient
from drinks.serializers import RecipeSerializer, RecipeListSerializer
from drinks.grammar import parse_search_and_filter
from .base import LazyViewSet, BlockPermission


class RecipePermission(BlockPermission):
    def get_block_from_body(self, data):
        return data.get('block')

    def get_block_from_obj(self, obj):
        return obj.block_id

    def check_user_object(self, obj, user):
        # Recipes can only be modified by the creator or staff
        return user.is_staff or obj.added_by.id == user.id


class RecipeViewSet(LazyViewSet):
    permission_classes = (IsAuthenticated, RecipePermission)
    queryset = Recipe.objects.all().order_by('name')
    serializer_class = RecipeSerializer
    list_serializer_class = RecipeListSerializer

    filter_fields = {
        'id': ['in'],
        'name': ['exact']
    }

    def get_queryset(self):
        queryset = super(RecipeViewSet, self).get_queryset()

        # Apply permissions first - users can only see what they're permitted
        # to see, either public or groups they're a member of
        permissions = Q(block__public=True) | Q(block__users=self.request.user)
        queryset = queryset.filter(permissions)

        # Set up eager loading to avoid N+1 selects
        queryset = self.get_serializer_class().setup_eager_loading(queryset)
        queryset = queryset.annotate(comment_count=Count('comments', distinct=True))
        return queryset

    def get_serializer_class(self):
        if self.request.path == '/api/v1/recipes/' and self.request.method == 'GET':
            return self.list_serializer_class
        return self.serializer_class

    def filter_queryset(self, *args, **kwargs):
        qs = self.get_queryset()

        # Searching names and ingredients
        if self.request.GET.get('search'):
            terms = self.request.GET.getlist('search')
            for term in terms:
                qs = parse_search_and_filter(term, qs, self.request.user)
            qs = qs.distinct()

        return super(RecipeViewSet, self).filter_queryset(qs)

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
