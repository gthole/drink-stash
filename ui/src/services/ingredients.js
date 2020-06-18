import { BaseService } from './base';
import { CacheService } from './cache';

export class Ingredient {
    constructor(payload) {
        super();
        this.name = payload.name;
        this.category = payload.category;
        this.usage = payload.usage;
        this.substitutions = payload.substitutions;
    }

    toPayload() {
        return {
            name: this.name,
            category: this.category,
            substitutions: this.substitutions
        }
    }
}

export class IngredientService extends BaseService {
    baseUrl = '/api/v1/ingredients/';
    model = Ingredient
}
