from django.core.management.base import BaseCommand, CommandError
from drinks.models import Ingredient


class Command(BaseCommand):
    help = 'Clean up generic substitutions'

    def handle(self, *args, **options):
        qs = Ingredient.objects.exclude(generic=True)
        for ingredient in qs.iterator():
            subs = ingredient.substitutions.filter(generic=True)
            if len(subs) < 2:
                continue
            spec = max([len(s.name) for s in subs])
            for s in subs:
                if len(s.name) < spec:
                    ingredient.substitutions.remove(s)
