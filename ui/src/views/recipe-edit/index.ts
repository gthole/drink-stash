import _ from 'lodash';
import { Component, ElementRef } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Recipe, RecipeService } from '../../services/recipes';
import { Ingredient, IngredientService } from '../../services/ingredients';
import { UomService } from '../../services/uom';
import { Router } from '@angular/router';

@Component({
    selector: 'recipe-edit',
    templateUrl: './index.html'
})
export class RecipeEditComponent {
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private ingredientService: IngredientService,
        private uomService: UomService,
        private recipeService: RecipeService,
        private _elementRef: ElementRef
    ) {}

    recipe: Recipe;
    ingredients: string[];
    units: string[];

    errors: {[k: string]: string};
    loading: boolean;

    ngOnInit() {
        this.loading = true;
        this.route.params.subscribe((params: {slug}) => {
            Promise.all([
                this.ingredientService.getPage(),
                this.uomService.getPage()
            ]).then(([ingredResp, uomResp]) => {
                this.ingredients = _.reverse(_.sortBy(ingredResp.results, 'usage'))
                    .map(i => i.name);
                this.units = uomResp.results;
                if (params.slug) {
                    this.fetchId(params.slug);
                } else {
                    this.recipe = Recipe.createNew();
                    this.doneLoading();
                }
            });
        });
    }

    nameChange(name: string) {
        if (!name) {
            this.errors = null;
            return;
        }
        this.recipeService.getPage({name}).then((resp) => {
            if (resp.results.length && this.recipe.id !== resp.results[0].id) {
                this.errors = {name: 'That name is already taken.'};
            } else {
                this.errors = null;
            }
        });
    }

    fetchId(slug: string) {
        this.recipeService.getById(slug).then((recipe) => {
            this.recipe = recipe;
            this.doneLoading();
        });
    }

    doneLoading() {
        this.loading = false;
        setTimeout(() => this.focusName(), 100);
        // Fetch ingredient names
    }

    updateTags(tags: string[]) {
        this.recipe.tags = tags;
    }

    focusName(): void {
        this._elementRef.nativeElement.querySelector('#name').focus();
    }

    removeQuantity(name: string) {
        this.recipe.quantities = this.recipe.quantities.filter((q) => name !== q.name);
    }

    addQuantity() {
        this.recipe.addQuantity();
        const name = this.recipe.quantities.slice(-1)[0].name;
        setTimeout(() => {
            this._elementRef.nativeElement
                .querySelector(`#amount-${name}`)
                .focus();
        }, 100);
    }

    delete(): void {
        this.loading = true;
        this.recipeService.remove(this.recipe).then(
            () => this.router.navigateByUrl(`/recipes`),
            (err) => {
                this.loading = false;
                console.log(err);
            }
        );
    }

    parseAmount(q) {
        if (_.isNumber(q.amount)) {
            q.error = null;
            return;
        }
        try {
            if (q.amount.includes('/')) {
                const [num, den] = q.amount.split('/');
                q.amount = parseInt(num, 10) / parseInt(den, 10);
            } else {
                q.amount = parseFloat(q.amount);
            }
            if (!_.isFinite(q.amount)) throw new Error();
            q.error = null;
        } catch (e) {
            q.error = 'Invalid amount';
        }
    }

    save(createNew): void {
        // Make sure quantities exist and all have ingredient values
        this.recipe.quantities = this.recipe.quantities.filter((q) => {
            return q.ingredient.trim();
        });
        if (this.recipe.quantities.length < 2) return;

        // Parse and validate amounts
        this.recipe.quantities.forEach((q) => this.parseAmount(q));
        if (this.recipe.quantities.filter((q) => q.error).length) return;

        this.loading = true;
        let promise;
        if (this.recipe.id) {
            promise = this.recipeService.update(this.recipe);
        } else {
            promise = this.recipeService.create(this.recipe);
        }

        promise.then(
            (saved) => {
                if (!createNew) {
                    this.router.navigateByUrl(`/recipes/${saved.id}`);
                } else {
                    this.recipe = Recipe.createNew();
                    this.doneLoading();
                }
            },
            (err) => {
                this.loading = false;
                console.log(err);
            }
        );
    }
}
