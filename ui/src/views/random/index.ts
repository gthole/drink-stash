import _ from 'lodash';
import { Component } from '@angular/core';
import { Recipe, RecipeStub, RecipeService } from '../../services/recipes';
import { User, UserService } from '../../services/users';
import { Ingredient, IngredientService } from '../../services/ingredients';


@Component({
    selector: 'random-recipe',
    templateUrl: './index.html'
})
export class RandomRecipeComponent {
    constructor(
        private recipeService: RecipeService,
        private ingredientService: IngredientService,
        private userService: UserService,
    ) {}

    recipes: RecipeStub[];
    recipe: Recipe;

    error: string;
    loading: boolean;

    ngOnInit() {
        this.loading = true;

        this.recipeService.getPage({cabinet: 'true', per_page: 1000}).then((resp) => {
            this.recipes = resp.results;
            this.shuffle();
        })
    }

    shuffle() {
        this.loading = true;
        const index = Math.floor(Math.random() * 1000) % this.recipes.length;
        const shuffled = this.recipes[index];

        if (this.recipe && shuffled.id === this.recipe.id && this.recipes.length > 1) {
            return this.shuffle();
        }
        this.recipeService.getById(shuffled.id).then((recipe) => {
            this.loading = false;
            this.recipe = recipe;
        });
    }
}
