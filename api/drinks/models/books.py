from django.db.models import ForeignKey, CharField, ManyToManyField, Model, \
    BooleanField
from django.contrib.auth.models import User
from .base import DateMixin


class BookUser(Model):
    user = ForeignKey(User)
    book = ForeignKey('Book')
    owner = BooleanField(default=False)


class Book(DateMixin):
    name = CharField(max_length=255, db_index=True)
    public = BooleanField(default=False)

    users = ManyToManyField(
        User,
        related_name='books',
        through=BookUser
    )

    def __str__(self):
        return '%s (%s)' % (self.name, self.id)
