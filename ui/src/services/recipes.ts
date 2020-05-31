import { BaseModel, BaseService } from './base';
import { Book } from './books';
import { CacheService } from './cache';
import { stringify } from 'querystring';

export class RecipeStub extends BaseModel {
    id: number;
    slug: string;
    name: string;
    comment_count: number;
    ingredients: string[];
    created: string;
    added_by: any;
    tags: string[];

    constructor(payload: any) {
        super();
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

interface Quantity {
    amount: number;
    unit: string;
    ingredient: string;
    name?: string;
    hidden?: boolean;
}

export class Recipe extends RecipeStub {
    source: string;
    url: string;
    book: Book;
    directions: string;
    description: string;
    quantities: Quantity[];

    constructor(payload: any) {
        super(payload);
        this.source = payload.source;
        this.url = payload.url;
        this.book = payload.book;
        this.directions = payload.directions;
        this.description = payload.description;
        this.quantities = payload.quantity_set;

        this.quantities.forEach((q) => q.name = this.quantityName());
    }

    static createNew(): Recipe {
        const r = new Recipe({
            id: null,
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

    addQuantity() {
        let unit = 'oz';
        if (this.quantities.length) {
            unit = this.quantities.slice(-1)[0].unit;
        }
        this.quantities.push({
            amount: 0,
            unit: unit,
            ingredient: '',
            name: this.quantityName(),
            hidden: false
        });
    }

    quantityName() {
        return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
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
}
