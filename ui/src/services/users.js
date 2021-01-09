import { BaseService } from './base';

class User {
    constructor(payload) {
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
        this.display_mode = payload.display_mode;
    }

    toPayload() {
        return {
            id: this.id,
            first_name: this.first_name,
            last_name: this.last_name,
            email: this.email,
            display_mode: this.display_mode,
        }
    }
}

class UserService extends BaseService {
    baseUrl = '/api/v1/users/';
    model = User;

    updateCabinet(ingredients: string[]): Promise<Object> {
        const user_id = this.authService.getUserData().user_id;
        return fetch(`${this.baseUrl}${user_id}/cabinet/`, {
            method: 'PUT',
            body: JSON.stringify(ingredients),
            headers: this.getHeaders()
        });
    }
}

export { User, UserService };
