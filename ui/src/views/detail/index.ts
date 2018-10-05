import _ from 'lodash';
import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Recipe, RecipeService } from '../../services/recipes';
// import { Ingredient, IngredientService } from '../../../services/ingredients';
//
const units = {
    1: 'oz',
    2: 'dash',
    3: 'barspoon',
    4: 'pinch'
}

@Component({
    selector: 'recipe-detail',
    templateUrl: './index.html'
})
export class RecipeDetailComponent {
    constructor(
        private route: ActivatedRoute,
        // private ingredientService: IngredientService,
        private recipeService: RecipeService,
    ) {}

    recipe: Recipe;
    units = units;
    // ingredients: Ingredient[];

    error: string;
    loading: boolean;

    ngOnInit() {
        this.loading = true;
        this.route.params.subscribe((params: {id}) => {
            this.fetchId(params.id);
        });
    }

    fetchId(id: string) {
        this.recipeService.getById(id).then((recipe) => {
            this.recipe = recipe;
            this.loading = false;
        });
    }
}
