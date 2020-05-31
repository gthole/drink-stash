from datetime import timedelta
from django.utils.timezone import now
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

    def test_304_unmodified(self):
        Tag.objects.create(name='sour')
        resp = self.client.get(
            '/api/v1/tags/',
            HTTP_IF_MODIFIED_SINCE=now().isoformat(),
            HTTP_X_COUNT='1'
        )
        self.assertEqual(resp.status_code, 304)

    def test_no_304_if_modified(self):
        Tag.objects.create(name='sour')
        resp = self.client.get(
            '/api/v1/tags/',
            HTTP_IF_MODIFIED_SINCE=(now() - timedelta(minutes=5)).isoformat(),
            HTTP_X_COUNT='1'
        )
        self.assertEqual(resp.status_code, 200)

    def test_no_304_if_inaccurate_last_count(self):
        Tag.objects.create(name='sour')
        resp = self.client.get(
            '/api/v1/tags/',
            HTTP_IF_MODIFIED_SINCE=now().isoformat(),
            HTTP_X_COUNT='2'
        )
        self.assertEqual(resp.status_code, 200)

    def test_no_post(self):
        resp = self.client.post('/api/v1/tags/')
        self.assertEqual(resp.status_code, 405)

    def test_no_put(self):
        resp = self.client.put('/api/v1/tags/1/')
        self.assertEqual(resp.status_code, 405)

    def test_no_delete(self):
        resp = self.client.delete('/api/v1/tags/1/')
        self.assertEqual(resp.status_code, 405)
