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
        modified = self.request.META.get('HTTP_IF_MODIFIED_SINCE')
        if modified:
            parsed = date_parser.parse(modified)
            if self.queryset.only('created').latest('created').created <= parsed:
                raise NotModified
        return self.queryset


