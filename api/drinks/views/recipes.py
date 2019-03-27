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

        # Whether there are comments or not
        if self.request.GET.get('comments') == 'true':
            qs = self.filter_by_comments(qs)

        # User ingredient cabinet
        if self.request.GET.get('cabinet') == 'true':
            qs = self.filter_by_cabinet(qs)

        # Filter by tags
        if self.request.GET.get('tags'):
            for tag in self.request.GET.get('tags').split(','):
                qs = qs.filter(tags__name=tag)

        # Searching names and ingredients
        if self.request.GET.get('search'):
            qs = self.filter_by_search_terms(qs)

        return qs

    def filter_by_comments(self, qs):
        return qs.filter(comment_count__gt=0)

    def filter_by_cabinet(self, qs):
        # Build out the user cabinet with substitutions in two directions
        user_ingredients = Ingredient.objects.filter(
            id__in=UserIngredient.objects.filter(
                user=self.request.user
            ).values('ingredient')
        )
        subs = Ingredient.objects.filter(substitutions__in=user_ingredients)
        rsubs = Ingredient.objects.filter(
            id__in=user_ingredients.values('substitutions')
        )
        rsubsplusone = Ingredient.objects.filter(substitutions__in=rsubs)

        # Load the ids into memory, since we run into operational errors
        # without evaluating at this point
        cabinet = [
            i for i in
            user_ingredients.union(
                subs, rsubs, rsubsplusone
            ).values_list('id', flat=True)
        ]

        # Find all the quantities that require an ingredient the user
        # doesn't have, and get all the recipes that don't have one of those
        lacking = Quantity.objects.exclude(ingredient__in=cabinet)
        return qs.exclude(quantity__in=lacking)

    def filter_by_tags(self, qs):
        tags = self.request.GET.get('tags').split(',')
        for tag in tags:
            qs = qs.filter(tags__name=tag)
        return qs

    def filter_by_search_terms(self, qs):
        terms = self.request.GET.get('search').split(',')
        for term in terms:
            qs = parse_search_and_filter(term, qs)
        return qs.distinct()

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
