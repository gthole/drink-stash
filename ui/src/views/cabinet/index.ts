import _ from 'lodash';
import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
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
        private userService: UserService,
    ) {}

    user: User;
    ingredients: string[];
    ingredient: string;

    error: string;
    loading: boolean;

    ngOnInit() {
        this.loading = true;

        Promise.all([
            this.userService.getSelf(),
            this.ingredientService.getPage()
        ]).then(([user, ingredientResp]) => {
            this.loading = false;

            this.user = user;
            this.ingredients = ingredientResp.results.map(i => i.name);
        });
    }

    addIngredient(ev: {title: string}): void {
        if (!ev || !ev.title || !ev.title.trim()) return;
        const name = ev.title.trim();

        if (!this.user.ingredient_set.includes(name)) {
            this.user.ingredient_set.push(name);
            this.user.ingredient_set = _.sortBy(this.user.ingredient_set, (i) => {
                return i.toLowerCase();
            });
            this.save();

            // If it's a new ingredient, add it to the view locally
            if (!this.ingredients.includes(name)) {
                this.ingredients.push(name);
            }
        }

    }

    removeIngredient(name) {
        this.user.ingredient_set = this.user.ingredient_set.filter((i) => i != name);
        this.save();
    }

    save() {
        this.userService.updateSelf(this.user);
    }
}
