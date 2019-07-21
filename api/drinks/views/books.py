from rest_framework.permissions import IsAuthenticated, BasePermission, \
    SAFE_METHODS

from drinks.models import Book, BookUser
from drinks.serializers import BookSerializer
from .base import LazyViewSet


class BookViewPermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        """
        Only an owner can modify a given book
        """
        if request.method in SAFE_METHODS:
            return True

        return BookUser.objects.filter(
            book_id=obj.id,
            user_id=request.user.id,
            owner=True
        ).exists()


class BookViewSet(LazyViewSet):
    permission_classes = (IsAuthenticated, BookViewPermission)
    queryset = Book.objects.all().order_by('name')
    serializer_class = BookSerializer

    def get_queryset(self):
        queryset = super(BookViewSet, self).get_queryset()
        book_users = BookUser.objects.filter(
            user=self.request.user,
            owner=True
        ).values_list('book_id')
        return queryset.filter(pk__in=book_users)
