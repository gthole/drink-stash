import { Component, Input } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { User, UserService } from '../../services/users';
import { List, ListService, ListRecipe, ListRecipeService } from '../../services/lists';

@Component({
    selector: 'list-details',
    templateUrl: './index.html'
})
export class ListDetailsComponent {
    constructor(
        private authService: AuthService,
        private listService: ListService,
        private listRecipeService: ListRecipeService,
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    @Input() list_id: number = null;
    canEdit: boolean = false;
    loading: boolean = true;
    list: List;
    listRecipes: ListRecipe[];
    editingLr: {id: number, notes: string};

    ngOnInit() {
        this.ngOnChanges();
    }

    ngOnChanges() {
        this.route.params.subscribe((params: {id, username}) => {
            const id = this.list_id || params.id;
            Promise.all([
                this.authService.getUserData(),
                this.listService.getById(id),
                this.listRecipeService.getPage({user_list: id})
            ]).then(([activeUser, list, recipeResp]) => {
                // If we're on the wrong user for this list, take them to the right one
                if (list.user.username !== params.username) {
                    return this.router.navigateByUrl(`/users/${list.user.username}/lists/${list.id}`);
                }

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
