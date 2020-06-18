import _ from 'lodash';
import { Component, ElementRef } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Recipe, RecipeService } from '../../services/recipes';
import { Book, BookService } from '../../services/books';
import { Ingredient, IngredientService } from '../../services/ingredients';
import { UomService } from '../../services/uom';
import { Router } from '@angular/router';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

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
        private bookService: BookService,
        private recipeService: RecipeService,
        private _elementRef: ElementRef
    ) {}

    recipe: Recipe;
    books: Book[];
    ingredients: string[];
    units: string[];

    errors: {[k: string]: string} = {};
    loading: boolean;
    faTimes = faTimes;

    ngOnInit() {
        this.loading = true;
        this.route.params.subscribe((params: {slug}) => {
            Promise.all([
                this.bookService.getPage(),
                this.ingredientService.getPage(),
                this.uomService.getPage()
            ]).then(([bookResp, ingredResp, uomResp]) => {
                this.books = bookResp.results;
                this.ingredients = _.reverse(_.sortBy(ingredResp.results, 'usage'))
                    .map(i => i.name);
                this.units = uomResp.results;
                if (params.slug) {
                    this.fetchId(params.slug);
                } else {
                    this.recipe = Recipe.createNew();
                    this.recipe.book = this.books[0];
                    this.doneLoading();
                }
            });
        });
    }

    nameChange(name: string) {
        if (!name) {
            delete this.errors.name;
            return;
        }
        // Check that the recipe is not already in the book
        this.recipeService.getPage({name, book_id: this.recipe.book.id}).then((resp) => {
            if (resp.results.length && this.recipe.id !== resp.results[0].id) {
                this.errors.name = 'That name is already taken in this book.';
            } else {
                delete this.errors.name;
            }
        });
    }

    fetchId(slug: string) {
        this.recipeService.getById(slug).then((recipe) => {
            this.recipe = recipe;
            this.doneLoading();
        });
    }

    byId(i, j) {
        if (j) return i.id === j.id;
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
            delete this.errors[q.name];
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
            delete this.errors[q.name];
        } catch (e) {
            this.errors[q.name] = 'Invalid amount';
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

        // If there are any unaddressed errors, don't post
        if (Object.keys(this.errors).filter(e => this.errors[e]).length) {
            return;
        }

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
                    this.recipe.book = saved.book;
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
