import { HttpClient } from "@angular/common/http";
import { URLSearchParams } from "@angular/http";
import { Injectable } from '@angular/core';
import { BaseModel, BaseService } from './base';

class Recipe extends BaseModel {
    id: number;
    name: string;
    source: string;
    directions: string;
    description: string;
    created: Date;
    added_by: any;
    quantities: any[];

    constructor(payload) {
        super();
        this.id = payload.id;
        this.name = payload.name;
        this.source = payload.source;
        this.description = payload.description;
        this.directions = payload.directions;
        this.added_by = payload.added_by;
        this.created = new Date(payload.created);
        this.quantities = payload.quantity_set;

        this.quantities.forEach((q) => q.name = this.quantityName());

        this.setHash();
    }

    static createNew(): Recipe {
        const r = new Recipe({
            id: null,
            name: '',
            description: '',
            notes: '',
            directions: '',
            quantity_set: []
        });
        r.addQuantity();
        return r;
    }

    addQuantity() {
        let amount = 1,
            unit = 1;
        if (this.quantities.length) {
            unit = this.quantities.slice(-1)[0].unit;
        }
        this.quantities.push({
            amount: null,
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
            source: this.source,
            directions: this.directions,
            description: this.description,
            quantity_set: this.quantities
        }
    }
}

@Injectable()
class RecipeService extends BaseService {

    constructor(
        public http: HttpClient,
    ) { super(); }

    baseUrl = '/api/v1/recipes/';
    model = Recipe;
}

export { Recipe, RecipeService };
