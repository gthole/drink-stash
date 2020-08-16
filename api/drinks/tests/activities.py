from django.utils.timezone import now
from .base import BaseTestCase

class ActivityTestCase(BaseTestCase):
    fixtures = ['test/users', 'test/recipes', 'test/lists', 'test/comments']

    def test_get_activities(self):
        resp = self.client.get('/api/v1/activities/')
        self.assertEqual(len(resp.json()['results']), 9)
        self.assertEqual(
            resp.json()['results'][0],
            {
                'id': 2,
                'created': '2019-03-02T19:00:00-05:00',
                'recipe': {
                    'id': 2,
                    'slug': 'last-word',
                    'name': 'Last Word',
                    'ingredients': [
                        'Gin',
                        'Green Chartreuse',
                        'Luxardo Maraschino',
                        'Lime Juice'
                    ]
                },
                'user_list': {
                    'id': 1,
                    'name': 'Recipes I Love'
                },
                'user': {
                    'id': 1,
                    'username':
                    'admin',
                    'first_name': 'Dorothea',
                    'last_name': 'Brooke',
                    'image': None
                },
                'body': None,
                'type': 'listrecipe',
                'count': 2
            }
        )

    def test_get_activities_filtered_recipe(self):
        resp = self.client.get('/api/v1/activities/?recipe=2')
        self.assertEqual(len(resp.json()['results']), 1)
        self.assertEqual(resp.json()['results'][0]['user_list']['id'], 1)

    def test_get_activities_filtered_user(self):
        resp = self.client.get('/api/v1/activities/?user=2')
        self.assertEqual(len(resp.json()['results']), 2)
        self.assertEqual(resp.json()['results'][1]['body'], 'Mediocre!')
