import _ from 'lodash';
import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AlertService } from '../../services/alerts';
import { Recipe, RecipeService } from '../../services/recipes';


@Component({
    selector: 'recipe-detail',
    templateUrl: './index.html'
})
export class RecipeDetailComponent {
    constructor(
        private route: ActivatedRoute,
        private alertService: AlertService,
        private recipeService: RecipeService,
    ) {}

    recipe: Recipe;
    error: string;
    loading: boolean;

    ngOnInit() {
        this.loading = true;
        this.route.params.subscribe((params: {id}) => {
            this.fetchId(params.id);
        });
    }

    fetchId(id: number) {
        this.recipeService.getById(id).then((recipe) => {
            this.recipe = recipe;
            this.loading = false;
        })
        .catch(() => {
            this.alertService.error('Could not fetch recipe');
        });
    }
}
