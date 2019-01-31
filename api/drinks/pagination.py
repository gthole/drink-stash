from rest_framework.pagination import PageNumberPagination


class PerPagePagination(PageNumberPagination):
    page_size = 5000
    page_query_param = 'page'
    page_size_query_param = 'per_page'
    max_page_size = 5000
