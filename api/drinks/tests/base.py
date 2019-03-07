from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient


class BaseTestCase(TestCase):
    fixtures = ['auth.json', 'recipes.json']
    client = None

    @classmethod
    def setUpTestData(cls):
        u = User.objects.get(pk=1)
        u.set_password('negroni')
        u.save()

    def setUp(self):
        client = APIClient()
        resp = client.post(
            '/api/v1/auth/',
            {'username': 'admin', 'password': 'negroni'}
        )
        auth = 'JWT %s' % resp.json()['token']
        self.client = APIClient(HTTP_AUTHORIZATION=auth)
