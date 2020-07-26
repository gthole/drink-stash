from datetime import datetime
from django.db.models import Max, Count, Value, CharField, IntegerField, F
from django.db.models.functions import Trunc, LastValue
from drinks.models import Recipe, UserListRecipe, Comment
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        r = Recipe.objects.filter(
            created__gt=datetime(2020, 6, 1, 0, 0)
        ).annotate(
            group=Trunc('created', 'hour')
        ).values(
            'group',
            'added_by'
        ).annotate(
            count=Count('id'),
            body=Value(None, output_field=CharField()),
            ref_id=Max('id'),
            type=Value('recipe', output_field=CharField()),
            uid=F('added_by'),
            ts=Max('created'),
        )

        lr = UserListRecipe.objects.filter(
            created__gt=datetime(2020, 6, 1, 0, 0)
        ).annotate(
            group=Trunc('created', 'hour')
        ).values(
            'group',
            'user_list__user_id'
        ).annotate(
            count=Count('id'),
            body=Value(None, output_field=CharField()),
            ref_id=Max('id'),
            type=Value('listrecipe', output_field=CharField()),
            uid=F('user_list__user_id'),
            ts=Max('created'),
        )

        # Comments don't get grouped by timestamp
        c = Comment.objects.filter(
            created__gt=datetime(2020, 6, 1, 0, 0)
        ).annotate(
            group=F('created')
        ).values(
            'group',
            'user_id'
        ).annotate(
            count=Value(1, output_field=IntegerField()),
            body=F('text'),
            ref_id=F('recipe_id'),
            type=Value('comment', output_field=CharField()),
            uid=F('user_id'),
            ts=F('created')
        )

        q = lr.union(r, c).order_by('-ts')

        for res in q:
            print('user=%d type=%s count=%d' % (res['uid'], res['type'], res['count']))
