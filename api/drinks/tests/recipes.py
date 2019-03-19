from rest_framework.test import APIClient
from drinks.models import Recipe, Comment, Tag
from .base import BaseTestCase
import time

"""
Special Counsel: 1oz Rye, .75oz Strega, .75oz Sfumato, .75oz Lemon Juice
Last Word: equal parts Gin, Maraschino, Lime, Green Chartreuse
Manhattan: 2oz Rye, 1oz Sweet Vermouth, 2dash Angostura
Sazerac: 2oz Rye, 1 teaspoon Simple, 4dash Peychaud's, .25oz Herbsaint
Toronto: 2oz Rye, .25oz Fernet, .25oz Demerara, 2dash Angostura
End of Childcare Day: 1.5oz Rye, 1oz St.Germain, 1oz Lemon Juice
"""


class RecipeTestCase(BaseTestCase):
    def test_requires_login(self):
        client = APIClient()
        resp = client.get('/api/v1/recipes/')
        self.assertEqual(resp.status_code, 401)

    def test_fetch_recipes(self):
        """
        Fetch recipes from the API in list format
        """
        resp = self.client.get('/api/v1/recipes/')
        self.assertEqual(len(resp.json()['results']), 6)
        self.assertEqual(
            resp.json()['results'][0],
            {
                'added_by': {
                    'first_name': 'Dorothea',
                    'last_name': 'Brooke',
                    'id': 1,
                    'user_hash': 'd41d8cd98f00b204e9800998ecf8427e'
                },
                'comment_count': 0,
                'created': '2019-02-09T23:56:01.918000Z',
                'id': 6,
                'ingredients': ['Old Overholt Rye', 'St. Germain', 'Lemon Juice'],
                'name': 'End of Childcare Day',
                'tags': []
            }
        )

    def test_fetch_recipes_search(self):
        """
        Search finds a recipe by name
        """
        resp = self.client.get(
            '/api/v1/recipes/',
            {'search': 'last word'}
        )
        self.assertEqual(len(resp.json()['results']), 1)
        self.assertEqual(resp.json()['results'][0]['name'], 'Last Word')

    def test_fetch_recipes_search_ingredient(self):
        """
        Search finds a recipe by ingredient
        """
        resp = self.client.get(
            '/api/v1/recipes/',
            {'search': 'fernet'}
        )
        self.assertEqual(len(resp.json()['results']), 1)
        self.assertEqual(resp.json()['results'][0]['name'], 'Toronto')

    def test_fetch_recipes_search_constraint(self):
        """
        Search finds a recipe with an ingredient constraint
        """
        resp = self.client.get(
            '/api/v1/recipes/',
            {'search': 'rye > 1.5oz'}
        )
        self.assertEqual(len(resp.json()['results']), 3)
        self.assertEqual(
            [r['name'] for r in resp.json()['results']],
            ['Manhattan', 'Sazerac', 'Toronto']
        )

    def test_fetch_recipes_search_fractional_constraint(self):
        """
        Search finds a recipe with ingredient constraints in fractional form
        """
        resp = self.client.get(
            '/api/v1/recipes/',
            {'search': 'rye < 3/2 oz'}
        )
        self.assertEqual(len(resp.json()['results']), 1)
        self.assertEqual(resp.json()['results'][0]['name'], 'Special Counsel')

    def test_fetch_recipes_search_attribute(self):
        """
        Search a specific attribute
        """
        resp = self.client.get(
            '/api/v1/recipes/',
            {'search': 'directions=shake'}
        )
        self.assertEqual(len(resp.json()['results']), 3)
        self.assertEqual(
            [r['name'] for r in resp.json()['results']],
            ['End of Childcare Day', 'Last Word', 'Special Counsel']
        )

    def test_fetch_recipes_by_source(self):
        """
        Constrain a specific attribute
        """
        comment = Comment(user_id=1, recipe_id=2, text='Delicious!')
        comment.save()
        resp = self.client.get(
            '/api/v1/recipes/',
            {'search': 'source = greg'}
        )
        self.assertEqual(len(resp.json()['results']), 2)
        self.assertEqual(
            [r['name'] for r in resp.json()['results']],
            ['End of Childcare Day', 'Special Counsel']
        )

    def test_fetch_recipes_with_special_characters(self):
        """
        Constrain a specific attribute
        """
        comment = Comment(user_id=1, recipe_id=2, text='Delicious!')
        comment.save()
        resp = self.client.get(
            '/api/v1/recipes/',
            {'search': 'K\u00fcmmel'}
        )
        self.assertEqual(len(resp.json()['results']), 1)
        self.assertEqual(
            resp.json()['results'][0]['name'],
            'End of Childcare Day'
        )

    def test_fetch_recipes_with_attr_constraint(self):
        """
        Constrain a specific attribute
        """
        comment = Comment(user_id=1, recipe_id=2, text='Delicious!')
        comment.save()
        resp = self.client.get(
            '/api/v1/recipes/',
            {'search': 'comments > 0'}
        )
        self.assertEqual(len(resp.json()['results']), 1)
        self.assertEqual(resp.json()['results'][0]['id'], 2)

    def test_fetch_recipes_search_negation(self):
        """
        Search with a negative
        """
        resp = self.client.get(
            '/api/v1/recipes/',
            {'search': 'NOT rye'}
        )
        self.assertEqual(len(resp.json()['results']), 1)
        self.assertEqual(resp.json()['results'][0]['name'], 'Last Word')

    def test_fetch_recipes_comment_counts(self):
        """
        Comment counts should be returned
        """
        recipe = Recipe.objects.get(name='Last Word')
        comment = Comment(
            user_id=1,
            recipe_id=recipe.id,
            text='Delicious!'
        )
        comment.save()
        recipe.comments.add(comment)
        resp = self.client.get(
            '/api/v1/recipes/',
            {'search': 'last word'}
        )
        self.assertEqual(len(resp.json()['results']), 1)
        result = resp.json()['results'][0]
        self.assertEqual(result['name'], 'Last Word')
        self.assertEqual(result['comment_count'], 1)

    def test_fetch_recipes_filter_by_comments(self):
        """
        Return only recipes with comments
        """
        recipe = Recipe.objects.get(name='Last Word')
        comment = Comment(
            user_id=1,
            recipe_id=recipe.id,
            text='Delicious!'
        )
        comment.save()
        recipe.comments.add(comment)
        resp = self.client.get(
            '/api/v1/recipes/',
            {'comments': 'true'}
        )
        self.assertEqual(len(resp.json()['results']), 1)
        result = resp.json()['results'][0]
        self.assertEqual(result['name'], 'Last Word')
        self.assertEqual(result['comment_count'], 1)

    def test_create_recipe(self):
        tag = Tag.objects.create(name='bitter')
        resp = self.client.post(
            '/api/v1/recipes/',
            {
                'name': 'Negroni',
                'source': 'Classic Cocktail',
                'description': 'The classic cocktail from the count himself',
                'directions': 'Stir with ice and garnish with an orange peel',
                'tags': ['bitter'],
                'quantity_set': [
                    {'amount': 1, 'unit': 1, 'ingredient': 'Gin'},
                    {'amount': 1, 'unit': 1, 'ingredient': 'Campari'},
                    {'amount': 1, 'unit': 1, 'ingredient': 'Sweet Vermouth'}
                ]
            },
            format='json'
        )
        self.assertEqual(resp.status_code, 201)
        recipe = Recipe.objects.get(name='Negroni')
        self.assertEqual(recipe.source, 'Classic Cocktail')
        self.assertEqual(recipe.quantity_set.count(), 3)
        self.assertEqual([t for t in recipe.tags.all()], [tag])

    def test_delete_recipe(self):
        recipe = Recipe.objects.get(name='Special Counsel')
        resp = self.client.delete('/api/v1/recipes/%s/' % recipe.id)
        self.assertEqual(
            Recipe.objects.filter(name='Special Counsel').count(),
            0
        )

    def test_update_recipe(self):
        tags = [
            Tag.objects.create(name='bitter'),
            Tag.objects.create(name='served up'),
        ]
        recipe = Recipe.objects.get(name='Special Counsel')
        recipe.tags.add(Tag.objects.create(name='sweet'))
        resp = self.client.put(
            '/api/v1/recipes/%s/' % recipe.id,
            {
                'name': 'Special Counsel',
                'source': 'Greg, August 2018',
                'directions': recipe.directions,
                'description': recipe.description,
                'tags': ['bitter', 'served up'],
                'quantity_set': [
                    {'amount': 1, 'unit': 1, 'ingredient': 'Rye'},
                    {'amount': .75, 'unit': 1, 'ingredient': 'Strega'},
                    {'amount': .75, 'unit': 1, 'ingredient': 'Sfumato'},
                    {'amount': .75, 'unit': 1, 'ingredient': 'Lemon Juice'}
                ]
            },
            format='json'
        )
        self.assertEqual(resp.status_code, 200)
        recipe = Recipe.objects.get(name='Special Counsel')
        self.assertEqual(recipe.source, 'Greg, August 2018')
        self.assertEqual(recipe.quantity_set.count(), 4)
        self.assertEqual([t for t in recipe.tags.all()], tags)

    def test_nonadmin_cannot_update_recipe_not_owned(self):
        token = self.get_user_token('user')
        client = APIClient(HTTP_AUTHORIZATION=token)

        recipe = Recipe.objects.get(name='Special Counsel')
        resp = client.put(
            '/api/v1/recipes/%s/' % recipe.id,
            {
                'name': 'Special Counsel',
                'source': 'Greg, August 2018',
                'directions': recipe.directions,
                'description': recipe.description,
                'quantity_set': [
                    {'amount': 1, 'unit': 1, 'ingredient': 'Rye'},
                    {'amount': .75, 'unit': 1, 'ingredient': 'Strega'},
                    {'amount': .75, 'unit': 1, 'ingredient': 'Gin'}
                ]
            },
            format='json'
        )
        self.assertEqual(resp.status_code, 403)

        recipe = Recipe.objects.get(name='Special Counsel')
        self.assertEqual(recipe.source, 'Greg')
        self.assertEqual(recipe.quantity_set.count(), 4)
        self.assertEqual(
            [q.ingredient.name for q in recipe.quantity_set.iterator()],
            ['Rye', 'Strega', 'Sfumato', 'Lemon Juice']
        )

    def test_fetch_recipe(self):
        self.maxDiff = None
        recipe = Recipe.objects.get(name='Special Counsel')
        resp = self.client.get('/api/v1/recipes/%s/' % recipe.id)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(
            resp.json(),
            {
                'added_by': {
                    'first_name': 'Dorothea',
                    'last_name': 'Brooke',
                    'id': 1,
                    'user_hash': 'd41d8cd98f00b204e9800998ecf8427e'
                },
                'comment_count': 0,
                'created': '2018-10-10T14:14:40.019000Z',
                'id': recipe.id,
                'name': 'Special Counsel',
                'source': 'Greg',
                'directions': recipe.directions,
                'description': recipe.description,
                'tags': [],
                'quantity_set': [
                    {
                        'amount': 1.0,
                        'hidden': False,
                        'unit': 1,
                        'ingredient': 'Rye'
                    },
                    {
                        'amount': .75,
                        'hidden': False,
                        'unit': 1,
                        'ingredient': 'Strega'
                    },
                    {
                        'amount': .75,
                        'hidden': False,
                        'unit': 1,
                        'ingredient': 'Sfumato'
                    },
                    {
                        'amount': .75,
                        'hidden': False,
                        'unit': 1,
                        'ingredient': 'Lemon Juice'
                    }
                ]
            }
        )
