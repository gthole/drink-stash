from django.contrib.auth.models import User
from django.db.models import Model, CharField, DateField, FloatField, \
    IntegerField, BooleanField, ForeignKey, ManyToManyField, TextField


class Ingredient(Model):
    name = CharField(max_length=255, primary_key=True)
    description = CharField(max_length=255, blank=True, null=True)
    substitutions = ManyToManyField('Ingredient')

    def __unicode(self):
        return self.name


class Quantity(Model):
    amount = FloatField()
    unit = IntegerField(choices=(
        (1, 'oz'),
        (2, 'dash'),
        (3, 'barspoon'),
        (4, 'pinch'),
    ), null=True, blank=True)
    ingredient = ForeignKey('Ingredient')
    hidden = BooleanField(default=False)
    recipe = ForeignKey('Recipe')

    def __unicode__(self):
        return '%s %s' % (self.amount, self.ingredient)


class Recipe(Model):
    name = CharField(max_length=255)
    source = CharField(max_length=255)

    directions = TextField(blank=True, null=True)
    description = TextField(blank=True, null=True)
    notes = TextField(blank=True, null=True)

    def __unicode__(self):
        return '%s (%s)' % (self.name, self.id)
