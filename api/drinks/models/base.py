from django.db.models import Model, DateTimeField
from django.utils.timezone import now


class DateMixin(Model):
    created = DateTimeField(default=now, blank=True)
    updated = DateTimeField(default=now, blank=True)

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.updated = now()
        super(DateMixin, self).save(*args, **kwargs)
