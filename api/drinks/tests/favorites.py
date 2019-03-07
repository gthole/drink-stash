from drinks.models import Recipe, UserFavorite
from .base import BaseTestCase


class UserFavoriteTestCase(BaseTestCase):
    fixtures = ['auth', 'recipes', 'favorites']

    def test_list_favorites(self):
        resp = self.client.get('/api/v1/favorites/')
        self.assertEqual(len(resp.json()['results']), 2)

    def test_list_favorites_by_recipe(self):
        resp = self.client.get('/api/v1/favorites/', {'recipe': 1})
        self.assertEqual(len(resp.json()['results']), 1)

    def test_list_favorites_by_user(self):
        resp = self.client.get('/api/v1/favorites/', {'user': 2})
        self.assertEqual(len(resp.json()['results']), 1)
        self.assertEqual(resp.json()['results'][0]['recipe']['id'], 2)

    def test_create_favorite(self):
        resp = self.client.post(
            '/api/v1/favorites/',
            {'recipe': 2},
            format='json'
        )
        self.assertEqual(resp.status_code, 201)

    def test_remove_favorite(self):
        resp = self.client.delete('/api/v1/favorites/1/')
        self.assertEqual(resp.status_code, 204)
        self.assertEqual(UserFavorite.objects.filter(pk=1).count(), 0)

    def test_user_authorized_for_self_only(self):
        "TODO"
        pass

    def test_user_can_favorite_recipe_only_once(self):
        "TODO"
        pass
