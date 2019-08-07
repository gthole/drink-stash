from django.db.models import ForeignKey, TextField, FloatField, CharField, \
    ManyToManyField, Index, CASCADE
from django.contrib.auth.models import User
from .base import DateMixin
from .recipes import Recipe


class UserList(DateMixin):
    class Meta:
        indexes = [Index(fields=['-created'])]
        unique_together = (
            ('name', 'user'),
        )

    user = ForeignKey(User, blank=True, null=True, on_delete=CASCADE)
    name = CharField(max_length=255)
    description = TextField(blank=True, null=True)
    recipes = ManyToManyField(Recipe, through='UserListRecipe')

    def __str__(self):
        return '%s (%s)' % (self.name, self.id)


class UserListRecipe(DateMixin):
    class Meta:
        indexes = [Index(fields=['-created'])]
        unique_together = (
            ('recipe', 'user_list'),
        )

    recipe = ForeignKey(Recipe, on_delete=CASCADE)
    user_list = ForeignKey(UserList, on_delete=CASCADE, related_name='lists')

    notes = TextField(blank=True, null=True)
    order = FloatField(default=0)

    def __str__(self):
        return '%s (%s)' % (self.name, self.id)

    def update_list(self):
        self.user_list.updated = self.updated
        self.user_list.save()

    def delete(self, *args, **kwargs):
        self.update_list()
        super(UserListRecipe, self).delete(*args, **kwargs)

    def save(self, *args, **kwargs):
        super(UserListRecipe, self).save(*args, **kwargs)
        self.update_list()
