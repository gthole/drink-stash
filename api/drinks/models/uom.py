from django.db.models import CharField, Model


class Uom(Model):
    name = CharField(max_length=36, primary_key=True)

    def __str__(self):
        return self.name
