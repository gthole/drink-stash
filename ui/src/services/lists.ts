import { RecipeStub } from './recipes';
import { BaseModel, BaseService } from './base';
import { CacheService } from './cache';

export class List extends BaseModel {
    id: number;
    user: any;
    name: string;
    description: string
    recipe_count: number;
    created: string;
    updated: string;
    added_to_recipe: boolean;

    constructor(payload: any) {
        super();
        this.id = payload.id;
        this.user = payload.user;
        this.name = payload.name;
        this.description = payload.description;
        this.recipe_count = payload.recipe_count;
        this.created = payload.created;
        this.updated = payload.updated;
        this.added_to_recipe = false;
    }

    toPayload() {
        return {
            id: this.id,
            name: this.name,
            description: this.description
        }
    }
}

export class ListService extends BaseService {
    baseUrl = '/api/v1/lists/';
    model = List;
}

export class ListRecipe extends BaseModel {
    id: number;
    recipe: RecipeStub;
    list: {id: number, name: string};
    notes: string
    user: any;
    created: string;
    updated: string;

    editing: boolean = false;

    constructor(payload: any) {
        super();
        this.id = payload.id;
        this.recipe = new RecipeStub(payload.recipe);
        this.notes = payload.notes;
        this.list = payload.user_list;
        this.user = payload.user;
        this.created = payload.created;
        this.updated = payload.updated;
    }

    toPayload() {
        return {
            id: this.id,
            notes: this.notes,
            user_list: this.list.id,
            recipe: this.recipe.id
        }
    }
}

export class ListRecipeService extends BaseService {
    baseUrl = '/api/v1/list-recipes/';
    model = ListRecipe;
}
