from .base import BaseTestCase
from drinks.models import Recipe, UserList, UserListRecipe


class UserListTestCase(BaseTestCase):
    fixtures = ['users', 'test-recipes', 'lists']

    def test_list_user_lists(self):
        resp = self.client.get('/api/v1/lists/')
        self.assertEqual(len(resp.json()['results']), 2)

    def test_list_user_lists_by_user(self):
        resp = self.client.get('/api/v1/lists/', {'user': 2})
        self.assertEqual(len(resp.json()['results']), 1)
        self.assertEqual(resp.json()['results'][0]['user']['id'], 2)

    def test_create_user_list(self):
        resp = self.client.post(
            '/api/v1/lists/',
            {
                'name': 'My Awesome List',
                'description': 'So great, I really love this.'
            },
            format='json'
        )
        self.assertEqual(resp.status_code, 201)

    def test_edit_user_list(self):
        resp = self.client.put(
            '/api/v1/lists/1/',
            {
                'name': 'Recipes I Really Love',
            },
            format='json'
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(UserList.objects.get(id=1).name, 'Recipes I Really Love')

    def test_remove_comment(self):
        resp = self.client.delete('/api/v1/lists/1/')
        self.assertEqual(resp.status_code, 204)
        self.assertEqual(UserList.objects.filter(pk=1).count(), 0)

    def test_user_authorized_for_self_only(self):
        resp = self.client.delete('/api/v1/lists/2/')
        self.assertEqual(resp.status_code, 403)
        self.assertEqual(UserList.objects.filter(pk=2).count(), 1)

    def test_user_list_name_is_unique_for_user(self):
        resp = self.client.post(
            '/api/v1/lists/',
            {
                'name': 'Recipes I Love'
            },
            format='json'
        )
        self.assertEqual(resp.status_code, 400)
