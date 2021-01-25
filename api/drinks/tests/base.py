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


class BaseViewsTestCase(BaseTestCase):
    def test_index(self):
        resp = self.client.get('/')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue('A cocktail database for the in crowd' in str(resp.content))

    def test_recipes_index(self):
        resp = self.client.get('/recipes/')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue('A cocktail database for the in crowd' in str(resp.content))

    def test_recipes_index_slug(self):
        resp = self.client.get('/recipes/toronto')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue('Toronto' in str(resp.content))
        self.assertTrue('Fernet Branca' in str(resp.content))

    def test_recipes_index_qp(self):
        resp = self.client.get('/recipes/?show=toronto')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue('Toronto' in str(resp.content))
        self.assertTrue('Fernet Branca' in str(resp.content))

    def test_recipes_index_qp_no_slash(self):
        resp = self.client.get('/recipes?show=toronto')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue('Toronto' in str(resp.content))
        self.assertTrue('Fernet Branca' in str(resp.content))

    def test_recipes_index_not_found(self):
        resp = self.client.get('/recipes/?show=not-a-thing')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue('A cocktail database for the in crowd' in str(resp.content))
