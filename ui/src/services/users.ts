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

    constructor(payload: any) {
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

class UserService extends BaseService {
    baseUrl = '/api/v1/users/';
    model = User;

    getSelf() {
        const cached = this.cacheService.get('self');
        if (cached) {
            return Promise.resolve(cached);
        }
        return this.getById(this.authService.getUserData().user_id)
            .then((user) => {
                this.cacheService.set('self', user);
                return user;
            });
    }

    updateSelf(user: User) {
        this.cacheService.set('self', user);
        return this.update(user);
    }

    updateCabinet(ingredients: string[]): Promise<Object> {
        const user_id = this.authService.getUserData().user_id;
        return fetch(`${this.baseUrl}${user_id}/cabinet/`, {
            method: 'PUT',
            body: JSON.stringify(ingredients)
        });
    }

    resetPassword(current_password: string, new_password: string): Promise<Object> {
        const user_id = this.authService.getUserData().user_id;
        const payload = {current_password, new_password};
        return fetch(`${this.baseUrl}${user_id}/reset_password/`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
    }
}

export { User, UserService };
