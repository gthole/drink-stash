from django.core.management.base import BaseCommand, CommandError
from drinks.models import Recipe, Quantity, Ingredient


class Command(BaseCommand):
    help = 'Create some basic drinks to get us started'

    def handle(self, *args, **options):
        # Remove existing
        Recipe.objects.all().delete()
        Quantity.objects.all().delete()
        Ingredient.objects.all().delete()

        recipe = Recipe(
            name='Negroni',
            source='Standard cocktail',
            directions='Stir with ice, serve in a rocks glass with an orange peel.',
            description='The Negroni is an iconic Italian cocktail, made of one part gin, one part vermouth rosso (red, semi-sweet), and one part Campari, garnished with orange peel.'
        )
        recipe.save()

        gin = Ingredient(name='Gin')
        gin.save()

        campari = Ingredient(name='Campari')
        campari.save()

        vermouth = Ingredient(name='Vermouth')
        vermouth.save()

        for ingredient in (gin, campari, vermouth):
            Quantity(
                recipe=recipe,
                ingredient=ingredient,
                amount=1,
                unit=1
            ).save()

