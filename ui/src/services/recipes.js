import { BaseService } from './base';
import { Book } from './books';

export class RecipeStub {
    constructor(payload) {
        this.id = payload.id;
        this.slug = payload.slug;
        this.name = payload.name;
        this.comment_count = payload.comment_count;
        this.ingredients = payload.ingredients;
        this.added_by = payload.added_by;
        this.tags = payload.tags;
        this.created = payload.created;
    }

    toPayload(): any {
        throw new Error('Not implemented');
    }
}

export class Recipe extends RecipeStub {
    constructor(payload) {
        super(payload);
        this.source = payload.source;
        this.url = payload.url;
        this.book = new Book(payload.book);
        this.directions = payload.directions;
        this.description = payload.description;
        this.quantities = payload.quantity_set;
    }

    addQuantity() {
        let unit = 'oz';
        if (this.quantities.length) {
            unit = this.quantities.slice(-1)[0].unit;
        }
        this.quantities.push({
            amount: '',
            unit: unit,
            ingredient: '',
            hidden: false
        });
    }

    toPayload() {
        return {
            id: this.id,
            name: this.name,
            book: this.book ? this.book.id : null,
            source: this.source,
            url: this.url,
            directions: this.directions,
            description: this.description,
            quantity_set: this.quantities,
            tags: this.tags
        }
    }
}

export class RecipeService extends BaseService {
    baseUrl = '/api/v1/recipes/';
    model = Recipe;
    listModel = RecipeStub;

    static createNew() {
        const r = new Recipe({
            id: null,
            book: new Book({}),
            name: '',
            source: '',
            url: '',
            description: '',
            notes: '',
            directions: '',
            quantity_set: [],
            tags: [],
        });
        r.addQuantity();
        return r;
    }
}
