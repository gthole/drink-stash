import { HttpClient } from "@angular/common/http";
import { URLSearchParams } from "@angular/http";
import { Injectable } from '@angular/core';
import { BaseModel, BaseService } from './base';
import { AuthService } from './auth';

class Recipe extends BaseModel {
    id: number;
    name: string;
    source: string;
    directions: string;
    description: string;
    quantities: any[];

    constructor(payload) {
        super();
        this.id = payload.id;
        this.name = payload.name;
        this.source = payload.source;
        this.description = payload.description;
        this.directions = payload.directions;
        this.quantities = payload.quantity_set;

        this.setHash();
    }

    static createNew() {
        return new Recipe({
            id: null,
            name: '',
            description: '',
            notes: '',
            directions: '',
            quantity_set: [
                {amount: 1, unit: 1, ingredient: '', hidden: false}
            ]
        });
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
        public authService: AuthService,
    ) { super(); }

    baseUrl = '/api/v1/recipes/';
    model = Recipe;
}

export { Recipe, RecipeService };
