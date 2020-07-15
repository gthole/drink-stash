from django.db.models import CharField, Model, DateTimeField, IntegerField, \
    BooleanField, ManyToManyField
from drinks.constants import ingredient_categories, base_substitutions
import re
import unidecode

category_map = dict((v, k) for (k, v) in ingredient_categories)
discrete_uom = [
    '',
    'sprig',
    'leaf',
    'pinch',
    'cube',
    'slice',
    'wedge'
]

class Ingredient(Model):
    name = CharField(max_length=255, db_index=True, unique=True)
    created = DateTimeField(auto_now_add=True, blank=True)
    description = CharField(max_length=255, blank=True, null=True)
    substitutions = ManyToManyField('Ingredient', blank=True)
    category = IntegerField(
        choices=ingredient_categories,
        default=1,
    )
    generic = BooleanField(default=False)

    def __str__(self):
        return self.name

    def guess_category(self, quantity=None):
        # If we already have a non-default category, stop here
        if self.category and self.category > 1:
            return

        # Check keywords
        cleaned = unidecode.unidecode(self.name)
        for pattern, generic_name, category_name in base_substitutions:
            if re.search('\\b' + pattern + '\\b', cleaned, re.IGNORECASE):
                self.category = category_map[category_name]
                if generic_name:
                    generic, _ = Ingredient.objects.get_or_create(name=generic_name)
                    if generic.category == 1 or not generic.generic:
                        generic.generic = True
                        generic.category = category_map[category_name]
                        generic.save()
                    self.substitutions.add(generic)
                self.save()
                break

        # Bail if we found something
        if self.category and self.category > 1:
            return

        # Discrete things, like eggs and sugar cubes are likely to be kitchen
        # staples, as are "sprig", "leaf", or "pinch" unit things
        if quantity and quantity.unit in discrete_uom:
            self.category = 5
        elif self.id and self.quantity_set.filter(unit__in=discrete_uom).exists():
            self.category = 5
        # Otherwise, leave it uncategorized
        else:
            self.category = 1
