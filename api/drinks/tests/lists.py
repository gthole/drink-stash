from django.utils.timezone import now
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

    def test_remove_list(self):
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
            {'name': 'Recipes I Love'},
            format='json'
        )
        self.assertEqual(resp.status_code, 400)

    def test_304_unmodified_list(self):
        resp = self.client.get(
            '/api/v1/lists/',
            HTTP_IF_MODIFIED_SINCE=now().isoformat(),
            HTTP_X_COUNT='2'
        )
        self.assertEqual(resp.status_code, 304)

    def test_get_ulr_by_recipe(self):
        resp = self.client.get('/api/v1/list-recipes/', {'recipe': 1})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(
            [ulr['id'] for ulr in resp.json()['results']],
            [1, 3]
        )

    def test_list_ulrs_filters_by_book_access(self):
        # Set a recipe onto a private book
        r = Recipe.objects.get(pk=3)
        r.book_id = 2
        r.save()
        ulr = UserListRecipe.objects.create(recipe_id=3, user_list_id=1)

        resp = self.client.get('/api/v1/list-recipes/')
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(
            ulr.id in [r['id'] for r in resp.json()['results']]
        )

    def test_get_details_ulr_filters_by_book_access(self):
        # Set the recipe onto a private book
        r = Recipe.objects.get(pk=3)
        r.book_id = 2
        r.save()
        ulr = UserListRecipe.objects.create(recipe_id=3, user_list_id=1)

        resp = self.client.get('/api/v1/list-recipes/%d/' % ulr.id)
        self.assertEqual(resp.status_code, 404)

    def test_get_ulr_by_list(self):
        self.maxDiff = None
        resp = self.client.get('/api/v1/list-recipes/', {'user_list': 2})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(
            [ulr['id'] for ulr in resp.json()['results']],
            [3]
        )

        self.assertEqual(resp.json()['results'][0], {
            'id': 3,
            'notes': 'Awful',
            'order': 0.1,
            'recipe': {
                'id': 1,
                'ingredients': ['Rye', 'Strega', 'Sfumato', 'Lemon Juice'],
                'name': 'Special Counsel',
                'slug': 'special-counsel'
            },
            'user': {
                'first_name': 'Tertius',
                 'id': 2,
                 'image': None,
                 'last_name': 'Lydgate',
                 'username': 'user'
            },
            'user_list': {'id': 2, 'name': 'Recipes I Hate'},
            'created': resp.json()['results'][0]['created']
        })

    def test_get_ulr_by_user(self):
        resp = self.client.get('/api/v1/list-recipes/', {'user_list__user': 1})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(
            [ulr['id'] for ulr in resp.json()['results']],
            [1, 2]
        )

    def test_get_ulr_by_user_and_recipe(self):
        resp = self.client.get('/api/v1/list-recipes/', {'user_list__user': 1, 'recipe': 1})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(
            [ulr['id'] for ulr in resp.json()['results']],
            [1]
        )

    def test_create_user_list_recipe(self):
        resp = self.client.post(
            '/api/v1/list-recipes/',
            {
                'recipe': 3,
                'user_list': 1
            },
            format='json'
        )
        self.assertEqual(resp.status_code, 201)

    def test_remove_user_list_recipe(self):
        resp = self.client.delete('/api/v1/list-recipes/1/')
        self.assertEqual(resp.status_code, 204)

    def test_create_ulr_authorizes_against_books(self):
        # Set the recipe onto a private book
        r = Recipe.objects.get(pk=3)
        r.book_id = 2
        r.save()

        resp = self.client.post(
            '/api/v1/list-recipes/',
            {
                'recipe': 3,
                'user_list': 1
            },
            format='json'
        )
        self.assertEqual(resp.status_code, 403)

    def test_create_ulr_authorizes_against_books_as_non_owner(self):
        # Set the recipe onto a private book
        r = Recipe.objects.get(pk=3)
        r.book_id = 2
        r.save()

        # Lydgate has non-owner access to private book id=2, so can still
        # add recipes from it to his own lists
        client = self.get_user_client('user')
        resp = client.post(
            '/api/v1/list-recipes/',
            {
                'recipe': 3,
                'user_list': 2
            },
            format='json'
        )
        self.assertEqual(resp.status_code, 201)

    def test_405_on_ulr_update(self):
        resp = self.client.post(
            '/api/v1/list-recipes/1/',
            {
                'recipe': 3,
                'user_list': 2
            },
            format='json'
        )
        self.assertEqual(resp.status_code, 405)

    def test_304_unmodified(self):
        resp = self.client.get(
            '/api/v1/list-recipes/',
            HTTP_IF_MODIFIED_SINCE=now().isoformat(),
            HTTP_X_COUNT='3'
        )
        self.assertEqual(resp.status_code, 304)
