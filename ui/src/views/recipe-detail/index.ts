import _ from 'lodash';
import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Recipe, RecipeService } from '../../services/recipes';


@Component({
    selector: 'recipe-detail',
    templateUrl: './index.html'
})
export class RecipeDetailComponent {
    constructor(
        private route: ActivatedRoute,
        private recipeService: RecipeService,
    ) {}

    recipe: Recipe;
    error: string;
    loading: boolean;

    ngOnInit() {
        this.loading = true;
        this.route.params.subscribe((params: {slug}) => {
            this.fetchId(params.slug);
        });
    }

    fetchId(slug: string) {
        this.recipeService.getById(slug).then((recipe) => {
            this.recipe = recipe;
            this.loading = false;
        });
    }
}
