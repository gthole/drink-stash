from dateutil.parser import parse as parse_datetime
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import HTTP_400_BAD_REQUEST
from rest_framework import authentication, permissions
from datetime import datetime
from django.db.models import Max, Count, Value, CharField, IntegerField, F, Q, \
    Subquery, OuterRef
from django.db.models.functions import Trunc, LastValue
from django.contrib.auth.models import User
from drinks.models import Recipe, UserListRecipe, Comment
from drinks.serializers.recipes import ShorterNestedRecipeListSerializer
from drinks.serializers.users import NestedUserSerializer
from django.core.management.base import BaseCommand, CommandError


class ActivityView(APIView):
    """
    View get rolled up activity from the database instead of fetching
    all the content and then rolling up in the browser
    """
    permission_classes = (IsAuthenticated,)
    fields = (
        'last_id',
        'list',
        'group',
        'count',
        'body',
        'type',
        'last_ts',
        "recipe",
        'user',
    )

    def get(self, request, format=None):
        try:
            params = self.parse_params(request)
        except:
            return Response(
                {'message': 'invalid parameters'},
                status=HTTP_400_BAD_REQUEST
            )

        r = self.fetch_recipes(**params)
        lr = self.fetch_list_recipes(**params)
        c = self.fetch_comments(**params)
        try:
            limit = int(request.GET.get('per_page', 50))
            offset = (int(request.GET.get('page', 1)) - 1) * limit
        except:
            offset = 0
            limit = 50

        res = lr.union(r, c).order_by('-last_ts')[offset:offset + limit]
        self.fulfill_recipes(res)
        self.fulfill_users(res)
        self.fulfill_lists(res)

        trimmed = [
            dict((k, r.get(k)) for k in self.fields)
            for r in res
        ]

        return Response({'results': trimmed})

    def parse_params(self, request):
        params = {}
        if request.GET.get('start'):
            params['start'] = parse_datetime(request.GET['start'])
        if request.GET.get('recipe'):
            params['recipe'] = int(request.GET['recipe'])
        if request.GET.get('user'):
            params['user'] = int(request.GET['user'])
        return params

    def fetch_recipes(self, start=None, recipe=None, user=None):
        if recipe:
            return Recipe.objects.none()
        permissions = Q(book__public=True) | Q(book__users=self.request.user)
        params = {}
        if start:
            params['created__gt'] = start
        if user:
            params['added_by'] = user

        return Recipe.objects.filter(
                permissions,
                **params
            ).annotate(
                group=Trunc('created', 'hour')
            ).values(
                'group',
                'added_by'
            ).annotate(
                last_id=Max('id'),
                count=Count('id', distinct=True),
                body=Value(None, output_field=CharField()),
                ref_id=Max('id'),
                type=Value('recipe', output_field=CharField()),
                uid=F('added_by'),
                last_ts=Max('created'),
            )

    def fetch_list_recipes(self, start=None, recipe=None, user=None):
        permissions = Q(recipe__book__public=True) | \
                      Q(recipe__book__users=self.request.user)

        params = {}
        if start:
            params['created__gt'] = start
        if user:
            params['user_list__user_id'] = user
        if recipe:
            params['recipe_id'] = recipe

        return UserListRecipe.objects.filter(
                permissions,
                **params
            ).distinct().annotate(
                group=Trunc('created', 'hour')
            ).values(
                'group',
                'user_list__user_id'
            ).annotate(
                last_id=Max('id'),
                count=Count('id', distinct=True),
                body=Value(None, output_field=CharField()),
                ref_id=Max('recipe_id'),
                type=Value('listrecipe', output_field=CharField()),
                uid=F('user_list__user_id'),
                last_ts=Max('created'),
            )

    def fetch_comments(self, start=None, recipe=None, user=None):
        permissions = Q(recipe__book__public=True) | \
                      Q(recipe__book__users=self.request.user)
        params = {}
        if start:
            params['created__gt'] = start
        if user:
            params['user_id'] = user
        if recipe:
            params['recipe_id'] = recipe

        # Comments don't get grouped by timestamp
        return Comment.objects.filter(
                permissions,
                **params
            ).annotate(
                group=F('created')
            ).values(
                'group',
                'user_id'
            ).annotate(
                last_id=F('id'),
                count=Value(1, output_field=IntegerField()),
                body=F('text'),
                ref_id=F('recipe_id'),
                type=Value('comment', output_field=CharField()),
                uid=F('user_id'),
                last_ts=F('created')
            )

    def fulfill_recipes(self, results):
        rids = set(r['ref_id'] for r in results)
        qs = Recipe.objects.filter(pk__in=rids)
        serialized = ShorterNestedRecipeListSerializer(qs, many=True)
        keyed = dict((r['id'], r) for r in serialized.data)
        for res in results:
            res['recipe'] = keyed[res['ref_id']]

    def fulfill_users(self, results):
        uids = set(r['uid'] for r in results)
        qs = User.objects.filter(pk__in=uids)
        serialized = NestedUserSerializer(qs, many=True)
        keyed = dict((u['id'], u) for u in serialized.data)
        for res in results:
            res['user'] = keyed[res['uid']]

    def fulfill_lists(self, results):
        lrids = set(r['last_id'] for r in results if r['type'] == 'listrecipe')
        qs = UserListRecipe.objects.filter(pk__in=lrids).prefetch_related('user_list')
        keyed = dict(
            (lr.id, {'name': lr.user_list.name, 'id': lr.user_list.id})
            for lr in qs.all()
        )
        for res in results:
            if res['type'] == 'listrecipe':
                res['list'] = keyed[res['last_id']]


