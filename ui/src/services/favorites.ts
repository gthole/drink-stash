import { HttpClient } from "@angular/common/http";
import { URLSearchParams } from "@angular/http";
import { Injectable } from '@angular/core';
import { RecipeStub } from './recipes';
import { BaseModel, BaseService } from './base';

class Favorite extends BaseModel {
    id: number;
    user: any;
    recipe: RecipeStub;
    created: Date;

    constructor(payload) {
        super();
        this.id = payload.id;
        this.user = payload.user;
        this.recipe = new RecipeStub(payload.recipe);
        this.created = new Date(payload.created);

        this.setHash();
    }

    toPayload() {
        return {
            id: this.id,
            recipe: this.recipe.id,
        }
    }
}

@Injectable()
class FavoriteService extends BaseService {

    constructor(
        public http: HttpClient,
    ) { super(); }

    baseUrl = '/api/v1/favorites/';
    model = Favorite;
}

export { Favorite, FavoriteService };
