from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.views.decorators.csrf import ensure_csrf_cookie
from django.db.models import Q
from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from rest_framework.exceptions import APIException
from dateutil import parser as date_parser
import json

from drinks.models import Book, BookUser


class BookPermission(BasePermission):
    def get_book_from_body(self, data):
        raise NotImplemented

    def get_book_from_obj(self, obj):
        raise NotImplemented

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        # Can only create/edit objects if the user has access to
        # the requested book associated with the object
        if request.method in ('PUT', 'POST'):
            data = json.loads(request.body)
            book_id = self.get_book_from_body(data)
            if book_id is None:
                return False
            return BookUser.objects.filter(
                book_id=book_id,
                user=request.user.id,
                owner=True
            ).exists()

        return True

    def has_object_permission(self, request, view, obj):
        # Can only get details if book access is allowed
        if request.method == 'GET':
            book_id = self.get_book_from_obj(obj)
            return Book.objects.filter(
                Q(public=True) | Q(users=request.user.id),
                pk=book_id
            ).exists()
        elif request.method in SAFE_METHODS:
            return True

        # Comments can only by modified by their owner
        return self.check_user_object(obj, request.user)


@ensure_csrf_cookie
def index(request):
    return render(request, 'index.html')


class NotModified(APIException):
    status_code = 304
    default_detail = None


class LazyViewSet(ModelViewSet):
    audit_field = 'updated'

    def filter_queryset(self, queryset):
        filtered = super(LazyViewSet, self).filter_queryset(queryset)
        self.check_last_modified(filtered)
        return filtered

    def check_last_modified(self, queryset):
        """
        Do some inexpensive querying to see if the data set is unchanged since
        the last time it was requested
        """
        modified = self.request.META.get('HTTP_IF_MODIFIED_SINCE')
        last_count = self.request.META.get('HTTP_X_COUNT')
        if modified and last_count and last_count.isdigit():

            # Check to see if any records have been updated since the last query
            kw = {}
            kw['%s__gt' % self.audit_field] = date_parser.parse(modified)
            if queryset.filter(**kw).exists():
                return

            # Check to make sure the total is the same (no deletions)
            last_count = int(last_count)
            if queryset.count() != last_count:
                return
            raise NotModified
