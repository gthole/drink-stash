import _ from 'lodash';
import { Component, OnInit } from '@angular/core';
import { Recipe, RecipeService } from '../../services/recipes';
import { AuthService } from '../../services/auth';
import { ViewMetaService } from '../../services/view-meta';
import { User, UserService } from '../../services/users';
import { Ingredient, IngredientService } from '../../services/ingredients';


interface RecipeViewMeta {
    filters: string[];
    filterByCabinet: boolean;
}

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
        private viewMetaService: ViewMetaService,
    ) {}

    recipes: Recipe[];
    filtered: Recipe[];
    substitutions: {[k: string]: string[]} = {};
    userCabinet: Set<string> = new Set<string>();

    filter: string;
    meta: RecipeViewMeta;

    ngOnInit() {
        // Restore previous position and filters from meta service
        const meta = this.viewMetaService.getMeta('recipes');
        if (meta) {
            this.meta = meta;
        } else {
            this.meta = {
                filters: [],
                filterByCabinet: false
            };
        }

        Promise.all([
            this.recipeService.getList(),
            this.ingredientService.getList(),
            this.userService.getSelf(),
        ]).then(([recipes, ingredients, user]) => {
            this.recipes = _.sortBy(recipes, (r) => r.name.replace(/^the /i, ''));

            ingredients.forEach((i) => this.substitutions[i.name] = i.substitutions);
            user.ingredient_set.forEach((i) => {
                this.userCabinet.add(i);
                (this.substitutions[i] || []).forEach((s) => this.userCabinet.add(s));
            });

            this.applyFilters();
        });
    }

    toggleCabinet() {
        this.meta.filterByCabinet = !this.meta.filterByCabinet;
        this.applyFilters();
    }

    applyFilters() {
        this.filtered = this.recipes.filter((r) => {
            return _.every(this.meta.filters, (f) => {
                const nameMatch = r.name.toLowerCase().includes(f);
                const quanMatch = _.some(r.quantities, (q) => {
                    return q.ingredient.toLowerCase().includes(f);
                });
                return nameMatch || quanMatch;
            });
        });

        if (this.meta.filterByCabinet) {
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

        this.viewMetaService.setMeta('recipes', this.meta);
    }

    addFilter() {
        if (!this.filter) return;
        this.meta.filters.push(this.filter.toLowerCase());
        this.filter = '';
        this.applyFilters();
    }

    removeFilter(f: string) {
        this.meta.filters = this.meta.filters.filter((g) => g != f);
        this.applyFilters();
    }
}
