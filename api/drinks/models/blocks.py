from django.db.models import ForeignKey, CharField, ManyToManyField, Model, \
    BooleanField
from django.contrib.auth.models import User
from .base import DateMixin


class BlockUser(Model):
    user = ForeignKey(User)
    block = ForeignKey('Block')
    owner = BooleanField(default=False)


class Block(DateMixin):
    name = CharField(max_length=255, db_index=True)
    public = BooleanField(default=False)

    users = ManyToManyField(
        User,
        related_name='blocks',
        through=BlockUser
    )

    def __str__(self):
        return '%s (%s)' % (self.name, self.id)
