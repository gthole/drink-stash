from rest_framework.test import APIClient
from django.contrib.auth.models import User
from drinks.models import UserIngredient
from django.utils.timezone import now
from .base import BaseTestCase


class UserTestCase(BaseTestCase):
    def test_list_users(self):
        resp = self.client.get('/api/v1/users/')
        self.assertEqual(len(resp.json()['results']), 2)

    def test_get_user(self):
        resp = self.client.get('/api/v1/users/1/')
        self.assertEqual(
            resp.json(),
            {
                'comment_count': 0,
                'recipe_count': 6,
                'first_name': 'Dorothea',
                'id': 1,
                'ingredient_set': [],
                'is_staff': True,
                'last_name': 'Brooke',
                'user_hash': 'd41d8cd98f00b204e9800998ecf8427e',
                'username': 'admin'
            }
        )

    def test_get_user_by_username(self):
        resp = self.client.get('/api/v1/users/admin/')
        self.assertEqual(resp.status_code, 200)

    def test_update_self(self):
        resp = self.client.put(
            '/api/v1/users/1/',
            {
                'first_name': 'Dodo',
                'id': 1,
                'ingredient_set': [
                    'Lemon Juice',
                    'Gin'
                ],
                'last_name': 'Brooke',
                'username': 'admin'
            },
            format='json'
        )
        self.assertEqual(resp.status_code, 200)
        # self.assertEqual(User.objects.get(pk=1).first_name, 'Dodo')
        self.assertEqual(
            [
                ui.ingredient.name for ui in
                UserIngredient.objects.filter(user_id=1).iterator()
            ],
            ['Gin', 'Lemon Juice']
        )

    def test_cannot_create_users(self):
        resp = self.client.post(
            '/api/v1/users/',
            {
                'first_name': 'New',
                'ingredient_set': [],
                'is_staff': True,
                'last_name': 'User',
                'username': 'fake'
            },
            format='json'
        )
        self.assertEqual(resp.status_code, 405)
        self.assertEqual(User.objects.all().count(), 2)

    def test_cannot_create_users_via_put(self):
        resp = self.client.put(
            '/api/v1/users/3/',
            {
                'first_name': 'New',
                'id': 3,
                'ingredient_set': [],
                'is_staff': True,
                'last_name': 'User',
                'username': 'fake'
            },
            format='json'
        )
        self.assertEqual(resp.status_code, 404)
        self.assertEqual(User.objects.all().count(), 2)

    def test_cannot_change_nonself_user(self):
        client = self.get_user_client('user')
        resp = client.put(
            '/api/v1/users/1/',
            {
                'first_name': 'Dorothea',
                'id': 1,
                'ingredient_set': [],
                'is_staff': False,
                'last_name': 'Brooke',
                'username': 'admin'
            },
            format='json'
        )
        self.assertEqual(resp.status_code, 403)

    def test_cannot_change_is_staff(self):
        client = self.get_user_client('user')
        resp = client.put(
            '/api/v1/users/2/',
            {
                'first_name': 'Tertius',
                'id': 2,
                'ingredient_set': [],
                'is_staff': True,
                'last_name': 'Lydgate',
                'username': 'user'
            },
            format='json'
        )
        # Request succeeds, but attribute change is ignored
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(User.objects.get(pk=2).is_staff, False)

    def test_cannot_remove_users(self):
        resp = self.client.delete('/api/v1/users/2/')
        self.assertEqual(resp.status_code, 405)
        self.assertEqual(User.objects.all().count(), 2)
