from django.contrib.auth.models import User
from django.db.models import Model, CharField, DateField, FloatField, \
    IntegerField, BooleanField, ForeignKey, ManyToManyField, TextField, \
    DateTimeField


class Ingredient(Model):
    name = CharField(max_length=255, db_index=True, unique=True)
    description = CharField(max_length=255, blank=True, null=True)
    substitutions = ManyToManyField('Ingredient', blank=True)

    def __str__(self):
        return self.name


class Quantity(Model):
    amount = FloatField()
    unit = IntegerField(choices=(
        (0, ''),
        (1, 'oz'),
        (2, 'dash'),
        (3, 'barspoon'),
        (4, 'pinch'),
        (5, 'teaspoon'),
        (6, 'tablespoon'),
        (7, 'sprig'),
        (8, 'leaf'),
        (9, 'spritz'),
    ), null=True, blank=True)
    ingredient = ForeignKey('Ingredient')
    hidden = BooleanField(default=False)
    recipe = ForeignKey('Recipe')

    def __str__(self):
        return '%s %s' % (self.amount, self.ingredient)


class Recipe(Model):
    name = CharField(max_length=255, db_index=True)
    source = CharField(max_length=255)

    directions = TextField(blank=True, null=True)
    description = TextField(blank=True, null=True)
    notes = TextField(blank=True, null=True)

    created = DateTimeField(auto_now_add=True, blank=True)
    added_by = ForeignKey(User, blank=True, null=True)

    def __str__(self):
        return '%s (%s)' % (self.name, self.id)


class UserIngredient(Model):
    user = ForeignKey(User, related_name='ingredient_set')
    ingredient = ForeignKey(Ingredient)
