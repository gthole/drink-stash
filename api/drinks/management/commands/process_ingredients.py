from django.core.management.base import BaseCommand, CommandError
from drinks.models import Recipe, Quantity, Ingredient
from drinks.constants import base_substitutions


class Command(BaseCommand):
    help = 'Create substitutions and add categories'

    def handle(self, *args, **options):
        for name in base_substitutions.values():
            Ingredient.objects.get_or_create(name=name)
        qs = Ingredient.objects.exclude(name__in=base_substitutions.values())
        for ingredient in qs.iterator():
            ingredient.guess_substitutions()
            ingredient.guess_category()
            if ingredient.category:
                ingredient.save()
