from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from drinks.models import Recipe


class BaseTestCase(TestCase):
    fixtures = ['test/users', 'test/recipes']
    client = None

    @classmethod
    def setUpTestData(cls):
        "Set user passwords"
        for uid in (1, 2):
            user = User.objects.get(pk=uid)
            user.set_password('negroni')
            user.save()

    def setUp(self):
        "Log in as default as an admin user"
        self.client = self.get_user_client('admin')

    def get_user_client(self, username):
        "Fetch a user token from the API"
        client = APIClient()
        resp = client.post(
            '/api/v1/auth/',
            {'username': username, 'password': 'negroni'}
        )
        token = 'JWT %s' % resp.json()['token']
        return APIClient(HTTP_AUTHORIZATION=token)

    def update_recipe_book(self, recipe_id, book_id):
        r = Recipe.objects.get(pk=recipe_id)
        r.book_id = book_id
        r.save()
