from django.views.decorators.csrf import ensure_csrf_cookie
from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from rest_framework.exceptions import APIException
from dateutil import parser as date_parser


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
