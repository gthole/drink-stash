import _ from 'lodash';
import { Component, OnInit } from '@angular/core';
import { Recipe, RecipeService } from '../../services/recipes';

@Component({
    selector: 'home-view',
    templateUrl: './index.html',
    styleUrls: ['./style.css']
})
export class HomeViewComponent implements OnInit {
    constructor(
        private recipeService: RecipeService,
    ) {}

    recipes: Recipe[];
    filtered: Recipe[];

    filter: string;
    filters: string[] = [];

    ngOnInit() {
        this.recipeService.getList().then((recipes) => {
            this.recipes = recipes;
            this.applyFilters();
        });
    }

    applyFilters() {
        this.filtered = this.recipes.filter((r) => {
            return _.every(this.filters, (f) => {
                const nameMatch = r.name.toLowerCase().includes(f);
                const quanMatch = _.some(r.quantities, (q) => {
                    return q.ingredient.toLowerCase().includes(f);
                });
                return nameMatch || quanMatch;
            });
        });
    }

    addFilter() {
        if (!this.filter) return;
        this.filters.push(this.filter.toLowerCase());
        this.filter = '';
        this.applyFilters();
    }

    removeFilter(f: string) {
        this.filters = this.filters.filter((g) => g != f);
        this.applyFilters();
    }
}
