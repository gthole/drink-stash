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

    parseQuantity(iq) {
        const q = {...iq};
        q.ingredient = q.ingredient.trim();
        try {
            const parsed = parseFloat(q.amount);
            if (typeof q === 'string' && q.amount.includes('/')) {
                const [num, den] = q.amount.split('/');
                q.amount = parseInt(num, 10) / parseInt(den, 10);
            } else if (!isNaN(parsed) && parsed > 0 && parsed < 100) {
                q.amount = parsed
            } else {
                throw new Error('Cannot parse amount: ' + q.amount);
            }
        } catch (e) {
            console.log(e);
            q.amount = null;
        }
        return q;
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
            quantity_set: this.quantities.map(q => this.parseQuantity(q)),
            tags: this.tags
        }
    }
}

export class RecipeService extends BaseService {
    baseUrl = '/api/v1/recipes/';
    model = Recipe;
    listModel = RecipeStub;

    static createNew(copyFrom) {
        const r = new Recipe({
            id: null,
            book: new Book({}),
            name: '',
            source: '',
            url: '',
            description: '',
            directions: copyFrom ? copyFrom.directions : '',
            quantity_set: copyFrom ? copyFrom.quantities : [],
            tags: copyFrom ? copyFrom.tags : [],
        });
        if (!copyFrom) {
            r.addQuantity();
        }
        return r;
    }
}
