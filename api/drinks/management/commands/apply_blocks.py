from django.core.management.base import BaseCommand, CommandError
from drinks.models import Recipe, RecipeBlock
from drinks.constants import base_substitutions


BLOCKS = [
    'Drink and Tell',
    'Drunk & Told',
    'The Ultimate Book of Cocktails',
    'Amaro Book',
    'I\'m Just Here for the Drinks'
]


class Command(BaseCommand):
    help = 'Convert Sources in Blocks'

    def handle(self, *args, **options):
        blocks = {}
        for name in BLOCKS:
            blocks[name] = RecipeBlock(name=name, public=False)
            blocks[name].save()

        blocks['Dr'] = blocks['Drink and Tell']
        blocks['Dri'] = blocks['Drink and Tell']

        for recipe in Recipe.objects.iterator():
            if blocks.get(recipe.source):
                recipe.block = blocks.get(recipe.source)
                recipe.save()
