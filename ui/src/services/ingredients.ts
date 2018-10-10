import { HttpClient } from "@angular/common/http";
import { URLSearchParams } from "@angular/http";
import { Injectable } from '@angular/core';
import { BaseModel, BaseService } from './base';

class Ingredient extends BaseModel {
    name: string;
    substitutions: string[];

    constructor(payload) {
        super();
        this.name = payload.name;
        this.substitutions = payload.substitutions;
        this.setHash();
    }

    toPayload() {
        return {
            name: this.name,
            substitutions: this.substitutions
        }
    }
}

@Injectable()
class IngredientService extends BaseService {

    constructor(
        public http: HttpClient,
    ) { super(); }

    baseUrl = '/api/v1/ingredients/';
    model = Ingredient;
}

export { Ingredient, IngredientService };
