from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from drinks.models import Comment, Recipe
from drinks.serializers import CommentSerializer
from drinks.views.base import LazyViewSet, BlockPermission


class CommentPermission(BlockPermission):
    def get_block_from_body(self, data):
        recipe_id = data.get('recipe')
        return Recipe.objects.get(pk=recipe_id).block_id

    def get_block_from_obj(self, obj):
        return obj.recipe.block_id

    def check_user_object(self, obj, user):
        return obj.user_id == user.id


class CommentViewSet(LazyViewSet):
    permission_classes = (IsAuthenticated, CommentPermission)
    queryset = Comment.objects.all().order_by('-created')
    serializer_class = CommentSerializer
    filter_fields = {
        'recipe': ['exact'],
        'user': ['exact'],
    }

    def get_queryset(self):
        queryset = super(CommentViewSet, self).get_queryset()
        permissions = Q(recipe__block__public=True) | \
                      Q(recipe__block__users=self.request.user)
        queryset = queryset.filter(permissions)
        # Set up eager loading to avoid N+1 selects
        if self.request.method == 'GET':
            queryset = self.get_serializer_class().setup_eager_loading(queryset)
        return queryset
