from django.core.management.base import BaseCommand, CommandError
from drinks.models import Ingredient


class Command(BaseCommand):
    help = 'Create substitutions and add categories'

    def handle(self, *args, **options):
        qs = Ingredient.objects.exclude(generic=True)
        for ingredient in qs.iterator():
            ingredient.guess_category()
            if ingredient.category > 1:
                ingredient.save()
        uncat = Ingredient.objects.filter(category=1).count()
        print('Remaining uncategorize: %d' % uncat)
        categorized = Ingredient.objects.filter(category__gt=1).count()
        print('Categorized: %d' % categorized)
        print('Percent: %s' % (100 * (categorized / (uncat + categorized))))
