from rest_framework.test import APIClient
from django.contrib.auth.models import User
from drinks.models import UserIngredient, Ingredient
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
                'last_name': 'Brooke',
                'username': 'admin'
            },
            format='json'
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(User.objects.get(pk=1).first_name, 'Dodo')

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

    def test_update_cabinet(self):
        resp = self.client.put(
            '/api/v1/users/1/cabinet/',
            ['Gin', 'Lemon Juice'],
            format='json'
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(
            [
                ui.ingredient.name for ui in
                UserIngredient.objects.filter(user_id=1).iterator()
            ],
            ['Gin', 'Lemon Juice']
        )

    def test_remove_from_cabinet(self):
        UserIngredient(user_id=1, ingredient=Ingredient.objects.get(name='Gin')).save()
        UserIngredient(user_id=1, ingredient=Ingredient.objects.get(name='Lemon Juice')).save()
        resp = self.client.put(
            '/api/v1/users/1/cabinet/',
            ['Gin'],
            format='json'
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(
            [
                ui.ingredient.name for ui in
                UserIngredient.objects.filter(user_id=1).iterator()
            ],
            ['Gin']
        )

    def test_no_update_other_user_cabinet(self):
        resp = self.client.put(
            '/api/v1/users/2/cabinet/',
            ['Gin', 'Lemon Juice'],
            format='json'
        )
        self.assertEqual(resp.status_code, 403)
        self.assertEqual(UserIngredient.objects.filter(user_id=2).count(), 0)

    def test_add_to_cabinet(self):
        UserIngredient(user_id=1, ingredient=Ingredient.objects.get(name='Gin')).save()
        resp = self.client.put(
            '/api/v1/users/1/cabinet/',
            ['Gin', 'Lemon Juice', 'Rye'],
            format='json'
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(
            [
                ui.ingredient.name for ui in
                UserIngredient.objects.filter(user_id=1).iterator()
            ],
            ['Gin', 'Rye', 'Lemon Juice']
        )

    def test_update_cabinet_unknown_ingredient(self):
        resp = self.client.put(
            '/api/v1/users/1/cabinet/',
            ['Gin', 'Foo Juice'],
            format='json'
        )
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(UserIngredient.objects.filter(user_id=1).count(), 0)

    def test_reset_password(self):
        resp = self.client.put(
            '/api/v1/users/1/reset_password/',
            {'current_password': 'negroni', 'new_password': 'fegroni'},
            format='json'
        )
        self.assertEqual(resp.status_code, 200)
        u = User.objects.get(pk=1)
        self.assertTrue(u.check_password('fegroni'))

    def test_check_password_on_reset(self):
        resp = self.client.put(
            '/api/v1/users/1/reset_password/',
            {'current_password': 'ginandtonic', 'new_password': 'fegroni'},
            format='json'
        )
        self.assertEqual(resp.status_code, 401)
        u = User.objects.get(pk=1)
        self.assertFalse(u.check_password('fegroni'))

    def test_no_reset_password_other_users(self):
        resp = self.client.put(
            '/api/v1/users/2/reset_password/',
            {'current_password': 'negroni', 'new_password': 'fegroni'},
            format='json'
        )
        self.assertEqual(resp.status_code, 403)
        u = User.objects.get(pk=2)
        self.assertFalse(u.check_password('fegroni'))
