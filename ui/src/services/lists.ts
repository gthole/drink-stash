import { HttpClient } from "@angular/common/http";
import { URLSearchParams } from "@angular/http";
import { Injectable } from '@angular/core';
import { RecipeStub } from './recipes';
import { BaseModel, BaseService } from './base';
import { CacheService } from './cache';

export class List extends BaseModel {
    id: number;
    user: any;
    name: string;
    description: string
    recipe_count: number;

    created: Date;
    updated: Date;

    constructor(payload) {
        super();
        this.id = payload.id;
        this.user = payload.user;
        this.name = payload.name;
        this.description = payload.description;
        this.recipe_count = payload.recipe_count;

        if (payload.created) {
            this.created = new Date(payload.created);
        }
        if (payload.updated) {
            this.updated = new Date(payload.updated);
        }


        this.setHash();
    }

    toPayload() {
        return {
            id: this.id,
            name: this.name,
            description: this.description
        }
    }
}

@Injectable()
export class ListService extends BaseService {

    constructor(
        public http: HttpClient,
        public cacheService: CacheService,
    ) { super(); }

    baseUrl = '/api/v1/lists/';
    model = List;
}


export class ListRecipe extends BaseModel {
    id: number;
    recipe: RecipeStub;
    list: number;
    notes: string
    created: Date;
    updated: Date;

    editing: boolean = false;

    constructor(payload) {
        super();
        this.id = payload.id;
        this.recipe = new RecipeStub(payload.recipe);
        this.notes = payload.notes;
        this.list = payload.user_list;

        if (payload.created) {
            this.created = new Date(payload.created);
        }
        if (payload.updated) {
            this.updated = new Date(payload.updated);
        }

        this.setHash();
    }

    toPayload() {
        return {
            id: this.id,
            notes: this.notes,
            user_list: this.list
        }
    }
}

@Injectable()
export class ListRecipeService extends BaseService {

    constructor(
        public http: HttpClient,
        public cacheService: CacheService,
    ) { super(); }

    baseUrl = '/api/v1/list-recipes/';
    model = ListRecipe;
}
