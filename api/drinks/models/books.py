from django.db.models import ForeignKey, CharField, ManyToManyField, Model, \
    BooleanField, CASCADE
from django.contrib.auth.models import User
from .base import DateMixin


class BookUser(Model):
    user = ForeignKey(User, on_delete=CASCADE)
    book = ForeignKey('Book', on_delete=CASCADE)
    owner = BooleanField(default=False)

    def __str__(self):
        return 'Permission for %s to %s' % (self.user.username, self.book.name)


class Book(DateMixin):
    name = CharField(max_length=255, db_index=True)
    public = BooleanField(default=False)

    users = ManyToManyField(
        User,
        related_name='books',
        through=BookUser
    )

    def __str__(self):
        return self.name
