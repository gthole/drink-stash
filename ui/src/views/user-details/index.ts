import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { User, UserService } from '../../services/users';
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
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    user: User;
    activeUser: User;
    comments: Comment[];

    ngOnInit() {
        this.route.params.subscribe((params: {id}) => {
            Promise.all([
                this.userService.getSelf(),
                this.userService.getById(params.id),
                this.commentService.getPage({user: params.id, ordering: '-created'})
            ]).then((res) => {
                this.activeUser = res[0];
                this.user = res[1];
                this.comments = res[2].results;
            });
        });
    }

    logout() {
        this.activeUser = null;
        this.authService.logout();
        this.router.navigateByUrl('/login');
    }
}
