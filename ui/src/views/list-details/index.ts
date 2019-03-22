import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { User, UserService } from '../../services/users';
import { List, ListService, ListRecipe, ListRecipeService } from '../../services/lists';

@Component({
    selector: 'list-details',
    templateUrl: './index.html'
})
export class ListDetailsComponent implements OnInit {
    constructor(
        private authService: AuthService,
        private listService: ListService,
        private listRecipeService: ListRecipeService,
        private route: ActivatedRoute,
    ) {}

    activeUser: User;
    list: List;
    listRecipes: ListRecipe[];

    ngOnInit() {
        this.route.params.subscribe((params: {id}) => {
            Promise.all([
                this.authService.getUserData(),
                this.listService.getById(params.id),
                this.listRecipeService.getPage({user_list: params.id})
            ]).then(([activeUser, list, recipeResp]) => {
                this.activeUser = activeUser;
                this.list = list
                this.listRecipes = recipeResp.results;
            });
        });
    }

    saveNote(lr) {
        this.listRecipeService.update(lr).then(() => {
            lr.editing = false
        });
    }
}
