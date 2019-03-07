from django.contrib.auth.models import User
from .base import BaseTestCase


class UsersTestCase(BaseTestCase):
    def test_list_users(self):
        resp = self.client.get('/api/v1/users/')
        self.assertEqual(len(resp.json()['results']), 2)

    def test_get_user(self):
        "TODO"
        pass

    def test_cannot_change_nonself_user(self):
        "TODO"
        pass

    def test_cannot_remove_users(self):
        "TODO"
        pass
