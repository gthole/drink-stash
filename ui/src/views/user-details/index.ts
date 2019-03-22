import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { User, UserService } from '../../services/users';
import { List, ListService } from '../../services/lists';
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
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    user: User;
    activeUser: User;
    lists: List[];
    comments: Comment[];

    ngOnInit() {
        this.route.params.subscribe((params: {id}) => {
            const query = {user: params.id, ordering: '-created'};
            Promise.all([
                this.userService.getSelf(),
                this.userService.getById(params.id),
                this.commentService.getPage(query),
            ]).then(([activeUser, user, comments]) => {
                this.activeUser = activeUser;
                this.user = user;
                this.comments = comments.results;

            });

            this.listService.getPage({user: params.id})
                .then((resp) => {
                    this.lists = resp.results;
                });
        });
    }

    logout() {
        this.activeUser = null;
        this.authService.logout();
        this.router.navigateByUrl('/login');
    }
}
