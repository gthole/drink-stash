import { RecipeStub } from './recipes';
import { BaseModel, BaseService } from './base';
import { CacheService } from './cache';

export class Comment extends BaseModel {
    id: number;
    user: any;
    recipe: RecipeStub;
    rating: number;
    text: string;
    created: string;
    updated?: string;

    constructor(payload: any) {
        super();
        this.id = payload.id;
        this.user = payload.user;
        this.recipe = new RecipeStub(payload.recipe);
        this.rating = payload.rating;
        this.text = payload.text;
        this.updated = payload.updated;
        this.created = payload.created;
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

export class CommentService extends BaseService {
    baseUrl = '/api/v1/comments/';
    model = Comment;
}
