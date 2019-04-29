from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.db.models import Model, ForeignKey, CASCADE
from .ingredients import Ingredient
from .base import DateMixin
from.books import Book, BookUser


class UserIngredient(Model):
    class Meta:
        unique_together = (
            ('user', 'ingredient'),
        )

    user = ForeignKey(User, related_name='ingredient_set', on_delete=CASCADE)
    ingredient = ForeignKey(Ingredient, on_delete=CASCADE)

    def __str__(self):
        return '%s: %s - %s' % (
            self.id,
            self.user.username,
            self.ingredient.name
        )


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        public = Book.objects.create(
            name='%s\'s Public Drinks' % instance.first_name,
            public=True
        )
        BookUser.objects.create(book=public, user=instance, owner=True)
        private = Book.objects.create(
            name='%s\'s Private Drinks' % instance.first_name,
            public=False
        )
        BookUser.objects.create(book=private, user=instance, owner=True)
