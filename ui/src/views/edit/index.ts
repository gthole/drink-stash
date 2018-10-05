import _ from 'lodash';
import { Component, ElementRef } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Recipe, RecipeService } from '../../services/recipes';
// import { Ingredient, IngredientService } from '../../../services/ingredients';
import { Router } from '@angular/router';

@Component({
    selector: 'recipe-edit',
    templateUrl: './index.html',
    styleUrls: ['./style.css'],
})
export class RecipeEditComponent {
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        // private ingredientService: IngredientService,
        private recipeService: RecipeService,
        private _elementRef: ElementRef
    ) {}

    recipe: Recipe;
    // ingredients: Ingredient[];

    error: string;
    loading: boolean;

    ngOnInit() {
        this.loading = true;
        this.route.params.subscribe((params: {id}) => {
            if (params.id) {
                this.fetchId(params.id);
            } else {
                this.recipe = Recipe.createNew();
                this.doneLoading();
            }
        });
    }

    fetchId(id: string) {
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

    removeQuantity(id: number) {
        this.recipe.quantities = this.recipe.quantities.filter((q) => q.id !== id);
    }

    addQuantity() {
        this.recipe.quantities.push({
            amount: 1,
            unit: 1,
            ingredient: '',
            hidden: false
        });
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

    save(): void {
        this.loading = true;
        let promise;
        if (this.recipe.id) {
            promise = this.recipeService.update(this.recipe);
        } else {
            promise = this.recipeService.create(this.recipe);
        }

        promise.then(
            (saved) => this.router.navigateByUrl(`/recipes/${saved.id}`),
            (err) => {
                this.loading = false;
                this.error = 'Whoops - something went wrong';
                console.log(err);
            }
        );
    }
}
