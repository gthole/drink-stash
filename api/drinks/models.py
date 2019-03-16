from datetime import datetime
from django.contrib.auth.models import User
from django.db.models import Model, CharField, DateField, FloatField, \
    IntegerField, BooleanField, ForeignKey, ManyToManyField, TextField, \
    DateTimeField, Index
from .constants import base_substitutions, category_keywords


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


class Tag(Model):
    name = CharField(max_length=255, unique=True, db_index=True)
    created = DateTimeField(default=datetime.now, blank=True)

    def __str__(self):
        return self.name


class Recipe(Model):
    class Meta:
        indexes = [Index(fields=['-created'])]

    name = CharField(max_length=255, unique=True, db_index=True)
    source = CharField(max_length=255)

    directions = TextField(blank=True, null=True)
    description = TextField(blank=True, null=True)

    created = DateTimeField(auto_now_add=True, blank=True)
    added_by = ForeignKey(User, blank=True, null=True)

    tags = ManyToManyField(Tag, related_name='recipes')

    def __str__(self):
        return '%s (%s)' % (self.name, self.id)


class UserFavorite(Model):
    class Meta:
        indexes = [Index(fields=['-created'])]

    user = ForeignKey(User, related_name='favorites')
    recipe = ForeignKey(Recipe, related_name='favorites')
    created = DateTimeField(auto_now_add=True, blank=True)


class UserIngredient(Model):
    user = ForeignKey(User, related_name='ingredient_set')
    ingredient = ForeignKey(Ingredient)


class Comment(Model):
    class Meta:
        indexes = [Index(fields=['-created'])]

    created = DateTimeField(auto_now_add=True, blank=True)
    updated = DateTimeField(auto_now=True, blank=True)
    user = ForeignKey(User, related_name='comments')
    recipe = ForeignKey(Recipe, related_name='comments')
    text = TextField()
