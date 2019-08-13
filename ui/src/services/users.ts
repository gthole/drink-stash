import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { BaseModel, BaseService } from './base';
import { CacheService } from './cache';
import { AuthService } from './auth';

class User extends BaseModel {
    id: number;
    username: string;
    image: string;
    first_name: string;
    last_name: string;
    ingredient_set: string[];
    is_staff: boolean;
    comment_count: boolean;
    recipe_count: boolean;
    email?: string;

    constructor(payload) {
        super();
        this.id = payload.id;
        this.username = payload.username;
        this.image = payload.image;
        this.first_name = payload.first_name;
        this.last_name = payload.last_name;
        this.ingredient_set = payload.ingredient_set;
        this.is_staff = payload.is_staff;
        this.comment_count = payload.comment_count;
        this.recipe_count = payload.recipe_count;
        this.email = payload.email;

        this.setHash();
    }

    toPayload() {
        return {
            id: this.id,
            first_name: this.first_name,
            last_name: this.last_name,
            email: this.email,
        }
    }
}

@Injectable()
class UserService extends BaseService {

    constructor(
        public http: HttpClient,
        public cacheService: CacheService,
        public authService: AuthService,
    ) {
        super();
        this.authService.authUpdates.subscribe((state) => {
            if (!state) {
                this._self = null;
            }
        });
    }

    baseUrl = '/api/v1/users/';
    model = User;
    _self: User;

    getSelf() {
        if (this._self) {
            return Promise.resolve(this._self);
        }
        return this.getById(this.authService.getUserData().user_id)
            .then((user) => {
                this._self = user;
                return user;
            });
    }

    updateSelf(user: User) {
        this._self = user;
        return this.update(user);
    }

    updateCabinet(ingredients: string[]): Promise<Object> {
        const user_id = this.authService.getUserData().user_id;
        return this.http.put(`${this.baseUrl}${user_id}/cabinet/`, ingredients)
            .toPromise();
    }

    resetPassword(current_password: string, new_password: string): Promise<Object> {
        const user_id = this.authService.getUserData().user_id;
        const payload = {current_password, new_password};
        return this.http.put(`${this.baseUrl}${user_id}/reset_password/`, payload)
            .toPromise();
    }
}

export { User, UserService };
