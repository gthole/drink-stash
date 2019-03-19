from django.db.models import CharField, Model, DateTimeField, IntegerField, \
    BooleanField, ManyToManyField
from drinks.constants import base_substitutions, category_keywords


class Ingredient(Model):
    name = CharField(max_length=255, db_index=True, unique=True)
    created = DateTimeField(auto_now_add=True, blank=True)
    description = CharField(max_length=255, blank=True, null=True)
    substitutions = ManyToManyField('Ingredient', blank=True)
    category = IntegerField(choices=(
        (1, 'Booze'),
        (2, 'Bitters'),
        (3, 'Syrup'),
        (4, 'Juice'),
        (5, 'Kitchen Staples'),
    ), default=1, null=True, blank=True)
    generic = BooleanField(default=False)

    def __str__(self):
        return self.name

    def guess_category(self, quantity=None):
        # If we have a non-default category, stop here
        if self.category and self.category > 1:
            return

        # Check keywords
        for key, value in category_keywords.items():
            if self.name.lower().endswith(key):
                self.category = value
                break

        # Bail if we found something
        if self.category and self.category > 1:
            return

        # Unital things, like eggs and sugar cubes are likely to be kitchen
        # staples, as are "sprig", "leaf", or "pinch" unit things
        if quantity and quantity.unit in [0, 4, 7, 8]:
            self.category = 5
        elif self.id and self.quantity_set.filter(unit__in=(0, 4, 7, 8)).exists():
            self.category = 5
        # Otherwise, probably a booze
        else:
            self.category = 1

    def guess_substitutions(self):
        if not self.id:
            return
        for key, val in base_substitutions.items():
            if self.name.lower().endswith(' %s' % key):
                sub = Ingredient.objects.get(name=val)
                self.substitutions.add(sub)
                break



