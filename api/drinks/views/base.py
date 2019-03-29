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
    def get_queryset(self):
        queryset = super(LazyViewSet, self).get_queryset()
        modified = self.request.META.get('HTTP_IF_MODIFIED_SINCE')
        if modified:
            since = date_parser.parse(modified)
            if not self.check_last_modified(queryset, since):
                raise NotModified
        return queryset

    def check_last_modified(self, queryset, since):
        return queryset.filter(created__gt=since).exists()
