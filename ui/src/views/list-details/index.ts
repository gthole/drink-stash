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

    canEdit: boolean = false;
    loading: boolean = true;
    list: List;
    listRecipes: ListRecipe[];
    editingLr: {id: number, notes: string};

    ngOnInit() {
        this.route.params.subscribe((params: {id}) => {
            Promise.all([
                this.authService.getUserData(),
                this.listService.getById(params.id),
                this.listRecipeService.getPage({user_list: params.id})
            ]).then(([activeUser, list, recipeResp]) => {
                this.canEdit = activeUser.user_id === list.user.id;
                this.list = list
                this.listRecipes = recipeResp.results;
                this.loading = false;
            });
        });
    }

    editLr(lr) {
        this.editingLr = {id: lr.id, notes: lr.notes || ''};
        setTimeout(() => document.getElementById('edit-lr').focus(), 10);
    }

    saveNote(lr) {
        lr.notes = this.editingLr.notes;
        this.loading = true;
        this.listRecipeService.update(lr).then(() => {
            this.loading = false;
            this.editingLr = null;
        });
    }
}
