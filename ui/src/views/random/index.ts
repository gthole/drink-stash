import _ from 'lodash';
import { Component } from '@angular/core';
import { Recipe, RecipeService } from '../../services/recipes';
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

    recipes: Recipe[];
    recipe: Recipe;

    error: string;
    loading: boolean;

    ngOnInit() {
        this.loading = true;

        Promise.all([
            this.recipeService.getList(),
            this.ingredientService.getList(),
            this.userService.getSelf(),
        ]).then(([recipes, ingredients, user]) => {

            // TODO: Dry up this cabinet filtering with the recipes list component
            const substitutions = {};
            const userCabinet: Set<string> = new Set();

            ingredients.forEach((i) => substitutions[i.name] = i.substitutions);
            user.ingredient_set.forEach((i) => {
                userCabinet.add(i);
                (substitutions[i] || []).forEach((s) => userCabinet.add(s));
            });

            this.recipes = recipes.filter((r) => {
                return _.every(r.quantities, (q) => {
                    // Either the ingredient itself is in the user cabinet
                    return userCabinet.has(q.ingredient) ||
                        // Or one of its substitutions is
                        _.some(
                            substitutions[q.ingredient] || [],
                            (s) => userCabinet.has(s)
                        );
                });
            });

            this.shuffle();
        })
    }

    shuffle() {
        const index = Math.floor(Math.random() * 1000) % this.recipes.length;
        this.recipe = this.recipes[index];
    }
}
