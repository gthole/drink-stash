import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { User, UserService } from '../../services/users';
import { Comment, CommentService } from '../../services/comments';
import { Favorite, FavoriteService } from '../../services/favorites';


@Component({
    selector: 'user-details',
    templateUrl: './index.html'
})
export class UserDetailsViewComponent implements OnInit {
    constructor(
        private authService: AuthService,
        private userService: UserService,
        private commentService: CommentService,
        private favoriteService: FavoriteService,
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    user: User;
    activeUser: User;
    comments: Comment[];
    favorites: Favorite[];

    ngOnInit() {
        this.route.params.subscribe((params: {id}) => {
            const query = {user: params.id, ordering: '-created'};
            Promise.all([
                this.userService.getSelf(),
                this.userService.getById(params.id),
                this.commentService.getPage(query),
                this.favoriteService.getPage(query),
            ]).then(([activeUser, user, comments, favorites]) => {
                this.activeUser = activeUser;
                this.user = user;
                this.comments = comments.results;
                this.favorites = favorites.results;
            });
        });
    }

    logout() {
        this.activeUser = null;
        this.authService.logout();
        this.router.navigateByUrl('/login');
    }
}
