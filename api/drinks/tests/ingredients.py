from rest_framework.test import APIClient
from drinks.models import Ingredient
from .base import BaseTestCase


class IngredientTestCase(BaseTestCase):
    def test_fetch_ingredients(self):
        resp = self.client.get('/api/v1/ingredients/')
        self.assertEqual(
            len(resp.json()['results']),
            Ingredient.objects.all().count()
        )
        self.assertEqual(
            resp.json()['results'][0],
            {
                "category": 2,
                "name": "Angostura Bitters",
                "substitutions": [],
                "usage": 2
            }
        )

    def test_no_post(self):
        resp = self.client.post('/api/v1/ingredients/')
        self.assertEqual(resp.status_code, 405)

    def test_no_put(self):
        resp = self.client.put('/api/v1/ingredients/1/')
        self.assertEqual(resp.status_code, 405)

    def test_no_delete(self):
        resp = self.client.delete('/api/v1/ingredients/1/')
        self.assertEqual(resp.status_code, 405)
