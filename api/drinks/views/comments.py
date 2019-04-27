from rest_framework.permissions import IsAuthenticated

from drinks.models import Comment
from drinks.serializers import CommentSerializer
from drinks.permissions import ObjectOwnerPermissions
from drinks.views.base import LazyViewSet


class CommentViewSet(LazyViewSet):
    permission_classes = (IsAuthenticated, ObjectOwnerPermissions)
    queryset = Comment.objects.all().order_by('-created')
    serializer_class = CommentSerializer
    filter_fields = {
        'recipe': ['exact'],
        'user': ['exact'],
    }

    def get_queryset(self):
        queryset = super(CommentViewSet, self).get_queryset()
        # Set up eager loading to avoid N+1 selects
        if self.request.method == 'GET':
            queryset = self.get_serializer_class().setup_eager_loading(queryset)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
