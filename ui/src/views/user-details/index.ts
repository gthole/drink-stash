import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { User, UserService } from '../../services/users';
import { List, ListService, ListRecipe, ListRecipeService } from '../../services/lists';
import { Comment, CommentService } from '../../services/comments';


@Component({
    selector: 'user-details',
    templateUrl: './index.html'
})
export class UserDetailsViewComponent implements OnInit {
    constructor(
        private authService: AuthService,
        private userService: UserService,
        private commentService: CommentService,
        private listService: ListService,
        private listRecipeService: ListRecipeService,
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    user: User;
    activeUser: {user_id: string};
    lists: List[];
    comments: Comment[];
    listRecipes: ListRecipe[];

    ngOnInit() {
        this.route.params.subscribe((params: {username}) => {
            this.activeUser = this.authService.getUserData();
            this.userService.getById(params.username).then((user) => {
                this.user = user;
                const query = {};
                this.listService.getPage({user: user.id, ordering: '-created'})
                    .then((resp) => this.lists = resp.results);
                this.getActivities();
            });
        });
    }

    getActivities(): void {
        Promise.all([
            this.commentService.getPage({
                user: this.user.id,
                ordering: '-created'
            }),
            this.listRecipeService.getPage({
                user_list__user: this.user.id,
                ordering: '-created'
            })
        ]).then(([comments, listRecipes]) => {
            this.comments = comments.results;
            this.listRecipes = listRecipes.results;
        });
    }
}
