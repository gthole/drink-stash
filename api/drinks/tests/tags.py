from rest_framework.test import APIClient
from drinks.models import Tag
from .base import BaseTestCase


class TagTestCase(BaseTestCase):
    def test_fetch_tags(self):
        Tag.objects.create(name='sour')
        Tag.objects.create(name='bitter')

        resp = self.client.get('/api/v1/tags/')
        self.assertEqual(
            len(resp.json()['results']),
            Tag.objects.all().count()
        )
        self.assertEqual(
            resp.json()['results'],
            ['bitter', 'sour']
        )

    def test_no_post(self):
        resp = self.client.post('/api/v1/tags/')
        self.assertEqual(resp.status_code, 405)

    def test_no_put(self):
        resp = self.client.put('/api/v1/tags/1/')
        self.assertEqual(resp.status_code, 405)

    def test_no_delete(self):
        resp = self.client.delete('/api/v1/tags/1/')
        self.assertEqual(resp.status_code, 405)
