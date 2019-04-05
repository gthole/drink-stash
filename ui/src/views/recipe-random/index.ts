import _ from 'lodash';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
        private route: ActivatedRoute,
    ) {}

    recipe: Recipe;
    count: number;

    search: string;
    loading: boolean;

    ngOnInit() {
        this.loading = true;

        this.route.queryParams.subscribe((qp) => {
            this.search = qp.search;
            const params = {search: this.search, per_page: 0};
            this.recipeService.getPage(params).then((resp) => {
                this.count = resp.count;
                if (this.count === 0) {
                    this.loading = false;
                    return;
                }
                this.shuffle();
            })
        });
    }

    shuffle() {
        this.loading = true;
        const index = Math.floor(Math.random() * this.count) + 1;
        const params = {
            search: this.search,
            per_page: 1,
            page: index
        };

        this.recipeService.getPage(params).then((resp) => {
            const rid = resp.results[0].id;
            if (this.count > 1 && this.recipe && this.recipe.id === rid) {
                return this.shuffle();
            }

            this.recipeService.getById(rid).then((recipe) => {
                this.loading = false;
                this.recipe = recipe;
            });
        });
    }
}
