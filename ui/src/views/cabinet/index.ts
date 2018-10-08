import _ from 'lodash';
import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AuthService } from '../../services/auth';
import { User, UserService } from '../../services/users';
import { Ingredient, IngredientService } from '../../services/ingredients';

@Component({
    selector: 'user-detail',
    templateUrl: './index.html',
    styleUrls: ['./style.css']
})
export class UserCabinetComponent {
    constructor(
        private ingredientService: IngredientService,
        private authService: AuthService,
        private userService: UserService,
    ) {}

    user: User;
    ingredients: Ingredient[];
    ingredient: string;

    error: string;
    loading: boolean;

    ngOnInit() {
        this.loading = true;

        Promise.all([
            this.userService.getById(`${this.authService.getUserData().user_id}`),
            this.ingredientService.getList()
        ]).then(([user, ingredients]) => {
            this.loading = false;

            this.user = user;
            this.ingredients = ingredients.map(i => i.name);
        });
    }

    addIngredient(ev: {title: string}): void {
        if (!ev) return;

        if (!this.user.ingredient_set.includes(ev.title)) {
            this.user.ingredient_set.push(ev.title);
            this.user.ingredient_set = _.sortBy(this.user.ingredient_set, (i) => {
                return i.toLowerCase();
            });
            this.save();
        }
    }

    removeIngredient(name) {
        this.user.ingredient_set = this.user.ingredient_set.filter((i) => i != name);
        this.save();
    }

    save() {
        this.userService.update(this.user);
    }
}
