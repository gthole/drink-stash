from django.contrib.auth.models import User
from django.db.models import Model, ForeignKey
from .ingredients import Ingredient
from .base import DateMixin


class UserIngredient(Model):
    class Meta:
        unique_together = (
            ('user', 'ingredient'),
        )

    user = ForeignKey(User, related_name='ingredient_set')
    ingredient = ForeignKey(Ingredient)
