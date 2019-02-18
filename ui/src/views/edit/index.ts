import _ from 'lodash';
import { Component, ElementRef } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Recipe, RecipeService } from '../../services/recipes';
import { Ingredient, IngredientService } from '../../services/ingredients';
import { Router } from '@angular/router';
import { units } from '../../constants';

@Component({
    selector: 'recipe-edit',
    templateUrl: './index.html',
    styleUrls: ['./style.css'],
})
export class RecipeEditComponent {
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private ingredientService: IngredientService,
        private recipeService: RecipeService,
        private _elementRef: ElementRef
    ) {}

    recipe: Recipe;
    ingredients: string[];
    units = units;
    objectKeys = Object.keys;

    error: string;
    loading: boolean;

    ngOnInit() {
        this.loading = true;
        this.route.params.subscribe((params: {id}) => {
            this.ingredientService.getPage().then((resp) => {
                this.ingredients = _.reverse(_.sortBy(resp.results, 'usage'))
                    .map(i => i.name);
                console.log(this.ingredients);
                if (params.id) {
                    this.fetchId(params.id);
                } else {
                    this.recipe = Recipe.createNew();
                    this.doneLoading();
                }
            });
        });
    }

    fetchId(id: number) {
        this.recipeService.getById(id).then((recipe) => {
            this.recipe = recipe;
            this.doneLoading();
        });
    }

    doneLoading() {
        this.loading = false;
        setTimeout(() => this.focusName(), 100);
        // Fetch ingredient names
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
                this.error = 'Whoops - something went wrong';
                console.log(err);
            }
        );
    }

    save(createNew): void {
        // Make sure quantities exist and all have ingredient values
        this.recipe.quantities = this.recipe.quantities.filter((q) => {
            return q.ingredient.trim();
        });
        if (this.recipe.quantities.length === 0) return;

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
                this.error = 'Whoops - something went wrong';
                console.log(err);
            }
        );
    }
}
