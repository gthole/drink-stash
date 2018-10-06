import _ from 'lodash';
import { Component, OnInit } from '@angular/core';
import { Recipe, RecipeService } from '../../services/recipes';

@Component({
    selector: 'home-view',
    templateUrl: './index.html',
})
export class HomeViewComponent implements OnInit {
    constructor(
        private recipeService: RecipeService,
    ) {}

    recentRecipes: Recipe[];

    ngOnInit() {
        this.recipeService.getList().then((recipes) => {
            this.recentRecipes = _.sortBy(recipes, 'created').slice(0, 10);
        });
    }
}
