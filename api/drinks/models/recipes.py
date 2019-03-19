from django.db.models import ForeignKey, TextField, FloatField, CharField, \
    ManyToManyField, Model, DateTimeField, IntegerField, BooleanField, Index
from django.contrib.auth.models import User
from drinks.models.ingredients import Ingredient
from .tags import Tag
from .base import DateMixin


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
        (10, 'wedge'),
    ), null=True, blank=True)
    ingredient = ForeignKey('Ingredient')
    hidden = BooleanField(default=False)
    recipe = ForeignKey('Recipe')

    def __str__(self):
        return '%s %s' % (self.amount, self.ingredient)


class Recipe(DateMixin):
    class Meta:
        indexes = [Index(fields=['-created'])]

    name = CharField(max_length=255, unique=True, db_index=True)
    source = CharField(max_length=255)
    directions = TextField(blank=True, null=True)
    description = TextField(blank=True, null=True)

    added_by = ForeignKey(User, blank=True, null=True)
    tags = ManyToManyField(Tag, related_name='recipes')

    def __str__(self):
        return '%s (%s)' % (self.name, self.id)
