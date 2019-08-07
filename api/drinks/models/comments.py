from django.contrib.auth.models import User
from django.db.models import ForeignKey, TextField, DateTimeField, Index, \
    CASCADE
from .recipes import Recipe
from .base import DateMixin


class Comment(DateMixin):
    class Meta:
        indexes = [Index(fields=['-created'])]
        unique_together = (
            ('user', 'recipe'),
        )

    created = DateTimeField(auto_now_add=True, blank=True)
    updated = DateTimeField(auto_now=True, blank=True)
    user = ForeignKey(User, related_name='comments', on_delete=CASCADE)
    recipe = ForeignKey(Recipe, related_name='comments', on_delete=CASCADE)
    text = TextField()

    def save(self, *args, **kwargs):
        super(Comment, self).save(*args, **kwargs)
        self.recipe.updated = self.updated
        self.recipe.save()
