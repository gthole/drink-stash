import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { Recipe, RecipeService } from '../../services/recipes';
import { List, ListService, ListRecipe, ListRecipeService } from '../../services/lists';

const err = 'There was an error saving your list.  Please try again later.';

@Component({
    selector: 'list-edit',
    templateUrl: './index.html'
})
export class ListEditComponent implements OnInit {
    constructor(
        private authService: AuthService,
        private listService: ListService,
        private listRecipeService: ListRecipeService,
        private recipeService: RecipeService,
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    list: List;
    recipes: Recipe[] = [];
    activeUser: {user_id: number, username: string};
    loading: boolean = true;

    ngOnInit() {
        this.activeUser = this.authService.getUserData();
        const id = this.route.snapshot.params.id,
              recipeIds = this.route.snapshot.queryParams.recipes;

        if (id) {
            this.getExisting(id);
        } else {
            this.getNew(recipeIds);
        }
    }

    getExisting(id) {
        this.listService.getById(id).then((list) => {
            this.loading = false;
            // If the user is trying to edit someone else's list, just go home
            if (list.user.id !== this.activeUser.user_id) {
                return this.router.navigateByUrl(`/users/${this.activeUser.username}`);
            }
            this.list = list
        });
    }

    getNew(recipeIds: string) {
        // Redirect to correct username creation endpoint
        const username = this.route.snapshot.params.username;
        if (username !== this.activeUser.username) {
            return this.router.navigateByUrl(`/users/${this.activeUser.username}/lists/new`);
        }

        if (recipeIds) {
            this.recipeService.getPage({id__in: recipeIds})
                .then((resp) => this.recipes = resp.results);
        }
        this.list = new List({name: '', description: ''});
        this.loading = false;
    }

    delete(): void {
        this.loading = true;
        this.listService.remove(this.list)
            .then(() => this.router.navigateByUrl(`/users/${this.activeUser.username}`));
    }

    update() {
        this.loading = true;
        this.listService.update(this.list).then(() => {
            this.router.navigateByUrl(`/users/${this.activeUser.username}/lists/${this.list.id}`);
        });
    }

    create() {
        this.loading = true;
        this.listService.create(this.list).then((saved) => {
            Promise.all(this.recipes.map((r) => {
                return this.listRecipeService.create(new ListRecipe({
                    user_list: saved.id,
                    recipe: {id: r.id}
                }));
            }))
            .then(() => {
                this.router.navigateByUrl(`/users/${this.activeUser.username}/lists/${saved.id}`);
            });
        });
    }
}
