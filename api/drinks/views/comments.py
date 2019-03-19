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

    def filter_queryset(self, *args, **kwargs):
        "Custom filtering to for exclude negations of users"
        qs = super().filter_queryset(*args, **kwargs)
        if self.request.GET.get('user!'):
            qs = qs.exclude(user__id=self.request.GET.get('user!'))
        return qs
