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
    activeUser: {user_id: string};
    lists: List[];
    comments: Comment[];

    ngOnInit() {
        this.route.params.subscribe((params: {id}) => {
            this.activeUser = this.authService.getUserData();
            this.userService.getById(params.id).then((user) => {
                this.user = user;

                const query = {user: user.id, ordering: '-created'};
                this.commentService.getPage(query)
                    .then((comments) => this.comments = comments.results);
                this.listService.getPage(query)
                    .then((resp) => this.lists = resp.results);
            });
        });
    }
}
