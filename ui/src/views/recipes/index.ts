import _ from 'lodash';
import { Component, OnInit } from '@angular/core';
import { Recipe, RecipeService } from '../../services/recipes';
import { AuthService } from '../../services/auth';
import { User, UserService } from '../../services/users';
import { Ingredient, IngredientService } from '../../services/ingredients';


@Component({
    selector: 'recipe-list',
    templateUrl: './index.html',
    styleUrls: ['./style.css']
})
export class RecipeListComponent implements OnInit {
    constructor(
        private recipeService: RecipeService,
        private ingredientService: IngredientService,
        private userService: UserService,
    ) {}

    recipes: Recipe[];
    filtered: Recipe[];
    substitutions: {[k: string]: string[]} = {};
    userCabinet: Set<string> = new Set<string>();

    filterByCabinet: boolean = false;
    filter: string;
    filters: string[] = [];

    ngOnInit() {
        Promise.all([
            this.recipeService.getList(),
            this.ingredientService.getList(),
            this.userService.getSelf(),
        ]).then(([recipes, ingredients, user]) => {
            this.recipes = _.sortBy(recipes, 'name');

            ingredients.forEach((i) => this.substitutions[i.name] = i.substitutions);
            user.ingredient_set.forEach((i) => {
                this.userCabinet.add(i);
                (this.substitutions[i] || []).forEach((s) => this.userCabinet.add(s));
            });

            this.applyFilters();
        });
    }

    toggleCabinet() {
        this.filterByCabinet = !this.filterByCabinet;
        this.applyFilters();
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

        if (!this.filterByCabinet) return;

        this.filtered = this.filtered.filter((r) => {
            return _.every(r.quantities, (q) => {
                // Either the ingredient itself is in the user cabinet
                return this.userCabinet.has(q.ingredient) ||
                    // Or one of its substitutions is
                    _.some(
                        this.substitutions[q.ingredient] || [],
                        (s) => this.userCabinet.has(s)
                    );
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
