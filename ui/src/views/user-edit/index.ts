import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { User, UserService } from '../../services/users';


@Component({
    selector: 'user-edit',
    templateUrl: './index.html'
})
export class UserEditViewComponent implements OnInit {
    constructor(
        private authService: AuthService,
        private userService: UserService,
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    user: User;
    loading: boolean = true;

    ngOnInit() {
        this.route.params.subscribe((params: {username}) => {
            const activeUser = this.authService.getUserData();
            if (activeUser.username !== params.username) {
                this.router.navigateByUrl('/');
                return;
            }

            this.userService.getById(params.username).then((user) => {
                this.loading = false;
                this.user = user
            });
        });
    }

    save() {
        this.loading = true;
        this.userService.update(this.user).then(() => {
            this.router.navigateByUrl(`/users/${this.user.username}`);
        });
    }
}
