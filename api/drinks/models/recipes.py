from django.db.models import ForeignKey, TextField, FloatField, CharField, \
    ManyToManyField, Model, IntegerField, BooleanField, Index, SlugField, \
    URLField, CASCADE, DO_NOTHING
from django.contrib.auth.models import User
from django.utils.text import slugify
from .books import Book
from .tags import Tag
from .base import DateMixin


class Quantity(Model):
    amount = FloatField()
    unit = ForeignKey('Uom', on_delete=CASCADE)
    ingredient = ForeignKey('Ingredient', on_delete=CASCADE)
    recipe = ForeignKey('Recipe', on_delete=CASCADE)
    hidden = BooleanField(default=False)

    def __str__(self):
        return '%s %s' % (self.amount, self.ingredient)


class Recipe(DateMixin):
    class Meta:
        indexes = [
            Index(fields=['-created']),
            Index(fields=['name']),
            Index(fields=['slug'])
        ]
        unique_together=[
            ['name', 'book']
        ]

    name = CharField(max_length=255)
    slug = SlugField(unique=True)
    source = CharField(max_length=255, blank=True, null=True)
    url = URLField(blank=True, null=True)
    directions = TextField(blank=True, null=True)
    description = TextField(blank=True, null=True)

    book = ForeignKey(Book, on_delete=DO_NOTHING)
    added_by = ForeignKey(User, blank=True, null=True, on_delete=DO_NOTHING)
    tags = ManyToManyField(Tag, related_name='recipes')

    def __str__(self):
        return '%s (%s)' % (self.name, self.id)

    def _get_unique_slug(self):
        base_slug = slugify(self.name)
        if base_slug.isdigit():
            base_slug = '_%s' % base_slug

        # Work through the database looking for an unassigned slug
        slug = base_slug
        count = 0
        while Recipe.objects.exclude(id=self.id).filter(slug=slug).exists():
            count += 1
            slug = '%s_%d' % (base_slug, count)
        return slug

    def save(self, *args, **kwargs):
        # Always do this on save - if the name changes, the slug should change
        self.slug = self._get_unique_slug()
        return super(Recipe, self).save(*args, **kwargs)
