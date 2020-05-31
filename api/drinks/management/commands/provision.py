from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from drinks.models import Recipe
from django.core.management import call_command


class Command(BaseCommand):
    help = 'Provision the database with a user and initial fixtures'

    def handle(self, *args, **options):
        create_user = (
            os.environ.get('DJANGO_SUPERUSER_USERNAME') and
            os.environ.get('DJANGO_SUPERUSER_EMAIL') and
            os.environ.get('DJANGO_SUPERUSER_PASSWORD') and
            User.objects.count() == 0
        )
        if create_user:
            call_command('createsuperuser')

        if Recipe.objects.count() == 0 and os.environ.get('INITIAL_FIXTURES'):
            fixtures = os.environ.get('INITIAL_FIXTURES').split(',')
            call_command('loaddata', *fixtures)
