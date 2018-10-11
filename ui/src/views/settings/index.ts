import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth';
import { User, UserService } from '../../services/users';
import { Router } from '@angular/router';


@Component({
    selector: 'settings-view',
    templateUrl: './index.html'
})
export class SettingsViewComponent implements OnInit {
    constructor(
        private authService: AuthService,
        private userService: UserService,
        private router: Router,
    ) {}

    user: User;

    ngOnInit() {
        this.userService.getSelf().then((user) => {
            this.user = user;
        });
    }

    logout() {
        this.user = null;
        this.authService.logout();
        this.router.navigateByUrl('/login');
    }
}
