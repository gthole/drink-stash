from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient


class BaseTestCase(TestCase):
    fixtures = ['users.json', 'test-recipes.json']
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
        auth = self.get_user_token('admin')
        self.client = APIClient(HTTP_AUTHORIZATION=auth)

    def get_user_token(self, username):
        "Fetch a user token from the API"
        client = APIClient()
        resp = client.post(
            '/api/v1/auth/',
            {'username': username, 'password': 'negroni'}
        )
        return 'JWT %s' % resp.json()['token']
