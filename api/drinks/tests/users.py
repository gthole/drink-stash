from rest_framework.test import APIClient
from django.core import mail
from django.contrib.auth.models import User
from drinks.models import UserIngredient, Ingredient, Book, BookUser, Profile
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
                'email': '',
                'display_mode': 'system',
                'image': None,
                'recipe_count': 6,
                'first_name': 'Dorothea',
                'email': 'dorothea@brooke.net',
                'id': 1,
                'ingredient_set': [],
                'is_staff': True,
                'last_name': 'Brooke',
                'username': 'admin'
            }
        )

    def test_get_other_user(self):
        """
        Non-self users should not include the email address
        """
        resp = self.client.get('/api/v1/users/2/')
        self.assertEqual(
            resp.json(),
            {
                'comment_count': 0,
                'image': None,
                'recipe_count': 0,
                'first_name': 'Tertius',
                'id': 2,
                'ingredient_set': [],
                'is_staff': False,
                'last_name': 'Lydgate',
                'username': 'user'
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
                'display_mode': 'light',
                'last_name': 'Brooke',
                'email': 'dodo@example.com',
                'username': 'admin'
            },
            format='json'
        )
        self.assertEqual(resp.status_code, 200)
        u = User.objects.get(pk=1)
        self.assertEqual(u.first_name, 'Dodo')
        self.assertEqual(u.profile.display_mode, 'light')

    def test_cannot_create_users(self):
        resp = self.client.post(
            '/api/v1/users/',
            {
                'first_name': 'New',
                'ingredient_set': [],
                'is_staff': True,
                'last_name': 'User',
                'email': 'user@example.com',
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
                'email': 'user@example.com',
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
                'display_mode': 'light',
                'ingredient_set': [],
                'is_staff': False,
                'last_name': 'Brooke',
                'email': 'dodo@example.com',
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
                'email': 'lydgate@example.com',
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

    def test_upload_profile_image(self):
        with open('./drinks/fixtures/test/profile.png', 'rb') as fp:
            resp = self.client.put(
                '/api/v1/users/1/profile_image/',
                {'image': fp}
            )
            self.assertEqual(resp.status_code, 200)

    def test_create_user_creates_book(self):
        """
        Test the signal that creates a user profile and a public book for the
        user to add recipes to
        """
        u = User(
            first_name='Celia',
            last_name='Brooke',
            email='celia@brooke.net',
            username='celia'
        )
        u.save()
        self.assertTrue(Profile.objects.filter(user=u).exists())
        self.assertTrue(Book.objects.filter(name='Celia\'s Drinks').exists())
        b = Book.objects.get(name='Celia\'s Drinks')
        self.assertTrue(b.public)
        self.assertTrue(BookUser.objects.filter(book=b, user=u).exists());
        bp = BookUser.objects.get(book=b, user=u)
        self.assertTrue(bp.owner)

        # Test that the welcome email was sent
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, 'Welcome to Drink Stash!')

    def test_login_with_email(self):
        "Fetch a user token from the API with email address"
        client = APIClient()
        resp = client.post(
            '/api/v1/auth/',
            {'username': 'dorothea@brooke.net', 'password': 'negroni'}
        )
        self.assertEqual(resp.status_code, 200)

    def test_login_with_no_email(self):
        "Fetch a user token from the API with email address"
        client = APIClient()
        resp = client.post(
            '/api/v1/auth/',
            {'password': 'negroni'}
        )
        self.assertEqual(resp.status_code, 400)
