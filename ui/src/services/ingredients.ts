import { HttpClient } from "@angular/common/http";
import { URLSearchParams } from "@angular/http";
import { Injectable } from '@angular/core';
import { BaseModel, BaseService } from './base';
import { CacheService } from './cache';


class Ingredient extends BaseModel {
    name: string;
    category: number;
    usage: number;
    substitutions: string[];

    constructor(payload) {
        super();
        this.name = payload.name;
        this.category = payload.category;
        this.usage = payload.usage;
        this.substitutions = payload.substitutions;
        this.setHash();
    }

    toPayload() {
        return {
            name: this.name,
            category: this.category,
            substitutions: this.substitutions
        }
    }
}

@Injectable()
class IngredientService extends BaseService {

    constructor(
        public http: HttpClient,
        public cacheService: CacheService,
    ) { super(); }

    baseUrl = '/api/v1/ingredients/';
    model = Ingredient;
}

export { Ingredient, IngredientService };
