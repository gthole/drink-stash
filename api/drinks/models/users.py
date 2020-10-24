from django.conf import settings
from django.core.mail import send_mail
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.contrib.auth.forms import PasswordResetForm
from django.db.models import Model, ForeignKey, CASCADE, OneToOneField, \
    ImageField, DateTimeField
from .ingredients import Ingredient
from .base import DateMixin
from .books import Book, BookUser


class UserIngredient(Model):
    class Meta:
        unique_together = (
            ('user', 'ingredient'),
        )

    user = ForeignKey(User, related_name='ingredient_set', on_delete=CASCADE)
    ingredient = ForeignKey(Ingredient, on_delete=CASCADE)

    def __str__(self):
        return '%s: %s - %s' % (
            self.id,
            self.user.username,
            self.ingredient.name
        )


class Profile(Model):
    user = OneToOneField(User, on_delete=CASCADE)
    image = ImageField(upload_to='profiles/', null=True, blank=True)
    last_seen = DateTimeField(null=True, blank=True)

    @property
    def profile(self):
        if self.image:
            return self.image.url;

    def __str__(self):
        return 'Profile for %s' % self.user.username


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.get_or_create(user=instance)
        public = Book.objects.create(
            name='%s\'s Drinks' % instance.first_name,
            public=True
        )
        BookUser.objects.create(book=public, user=instance, owner=True)

        if instance.email:
            form = PasswordResetForm({'email': instance.email})
            if form.is_valid():
                form.save(
                    subject_template_name='email/welcome_subject.txt',
                    email_template_name='email/welcome.txt',
                    html_email_template_name='email/welcome.html',
                    domain_override=settings.ALLOWED_HOSTS[0],
                    use_https=True
                )
