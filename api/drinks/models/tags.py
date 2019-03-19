from django.db.models import CharField, Model, DateTimeField


class Tag(Model):
    name = CharField(max_length=255, unique=True, db_index=True)
    created = DateTimeField(auto_now_add=True, blank=True)

    def __str__(self):
        return self.name
