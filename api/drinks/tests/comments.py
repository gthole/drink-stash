from django.utils.timezone import now
from .base import BaseTestCase
from drinks.models import Recipe, Comment


class CommentTestCase(BaseTestCase):
    fixtures = ['users', 'test-recipes', 'comments']

    def test_list_comments(self):
        resp = self.client.get('/api/v1/comments/')
        self.assertEqual(len(resp.json()['results']), 2)

    def test_list_comments_filters_by_block_access(self):
        self.update_recipe_block(recipe_id=1, block_id=2)
        resp = self.client.get('/api/v1/comments/')
        self.assertEqual(len(resp.json()['results']), 1)
        self.assertEqual(resp.json()['results'][0]['id'], 2)

    def test_get_comment_details(self):
        resp = self.client.get('/api/v1/comments/2/')
        self.assertEqual(resp.status_code, 200)

    def test_get_comment_filters_by_block_access(self):
        self.update_recipe_block(recipe_id=3, block_id=2)
        resp = self.client.get('/api/v1/comments/2/')
        self.assertEqual(resp.status_code, 404)

    def test_list_comments_by_recipe(self):
        resp = self.client.get('/api/v1/comments/', {'recipe': 1})
        self.assertEqual(len(resp.json()['results']), 1)
        self.assertEqual(resp.json()['results'][0]['recipe']['id'], 1)

    def test_list_comments_by_user(self):
        resp = self.client.get('/api/v1/comments/', {'user': 2})
        self.assertEqual(len(resp.json()['results']), 1)
        self.assertEqual(resp.json()['results'][0]['recipe']['id'], 3)

    def test_create_comment(self):
        resp = self.client.post(
            '/api/v1/comments/',
            {'recipe': 2, 'text': 'Yum!'},
            format='json'
        )
        self.assertEqual(resp.status_code, 201)

    def test_create_comment_authorizes_against_blocks(self):
        self.update_recipe_block(recipe_id=2, block_id=2)
        resp = self.client.post(
            '/api/v1/comments/',
            {'recipe': 2, 'text': 'Yum!'},
            format='json'
        )
        self.assertEqual(resp.status_code, 403)

    def test_edit_comment(self):
        resp = self.client.put(
            '/api/v1/comments/1/',
            {'recipe': 2, 'text': 'Totally delicious!'},
            format='json'
        )
        self.assertEqual(resp.status_code, 200)

    def test_edit_comment_authorizes_against_blocks(self):
        self.update_recipe_block(recipe_id=1, block_id=2)
        resp = self.client.put(
            '/api/v1/comments/1/',
            {'recipe': 1, 'text': 'Yup!'},
            format='json'
        )
        self.assertEqual(resp.status_code, 403)

    def test_remove_comment(self):
        resp = self.client.delete('/api/v1/comments/1/')
        self.assertEqual(resp.status_code, 204)
        self.assertEqual(Comment.objects.filter(pk=1).count(), 0)

    def test_user_authorized_for_self_only(self):
        resp = self.client.delete('/api/v1/comments/2/')
        self.assertEqual(resp.status_code, 403)
        self.assertEqual(Comment.objects.filter(pk=2).count(), 1)

    def test_user_can_comment_on_a_recipe_only_once(self):
        resp = self.client.post(
            '/api/v1/comments/',
            {'recipe': 1, 'text': 'Yum!'},
            format='json'
        )
        self.assertEqual(resp.status_code, 400)

    def test_304_unmodified(self):
        resp = self.client.get(
            '/api/v1/comments/',
            HTTP_IF_MODIFIED_SINCE=now().isoformat(),
            HTTP_X_COUNT='2'
        )
        self.assertEqual(resp.status_code, 304)

    def test_no_304_after_update(self):
        stamp = now().isoformat()
        resp = self.client.put(
            '/api/v1/comments/1/',
            {'recipe': 2, 'text': 'Totally delicious!'},
            format='json'
        )
        self.assertEqual(resp.status_code, 200)

        resp = self.client.get(
            '/api/v1/comments/',
            HTTP_IF_MODIFIED_SINCE=stamp,
            HTTP_X_COUNT='2'
        )
        self.assertEqual(resp.status_code, 200)
