import { HttpClient } from "@angular/common/http";
import { URLSearchParams } from "@angular/http";
import { Injectable } from '@angular/core';
import { RecipeStub } from './recipes';
import { BaseModel, BaseService } from './base';
import { CacheService } from './cache';


class Comment extends BaseModel {
    id: number;
    user: any;
    recipe: RecipeStub;
    rating: number;
    text: string;
    created: string;
    updated?: string;

    constructor(payload) {
        super();
        this.id = payload.id;
        this.user = payload.user;
        this.recipe = new RecipeStub(payload.recipe);
        this.rating = payload.rating;
        this.text = payload.text;
        this.updated = payload.updated;
        this.created = payload.created;
        this.setHash();
    }

    toPayload() {
        return {
            id: this.id,
            recipe: this.recipe.id,
            rating: this.rating,
            text: this.text
        }
    }
}

@Injectable()
class CommentService extends BaseService {

    constructor(
        public http: HttpClient,
        public cacheService: CacheService,
    ) { super(); }

    baseUrl = '/api/v1/comments/';
    model = Comment;
}

export { Comment, CommentService };
