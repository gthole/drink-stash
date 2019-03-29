from django.db.models import CharField, Model, DateTimeField


class Uom(Model):
    name = CharField(max_length=36, primary_key=True)
    created = DateTimeField(auto_now_add=True, blank=True)

    class Meta:
        verbose_name = 'unit of measure'
        verbose_name_plural = 'units of measure'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.name = self.name.lower()
        return super(Uom, self).save(*args, **kwargs)
