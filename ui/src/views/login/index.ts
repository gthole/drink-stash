import { Component } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
    selector: 'login',
    templateUrl: './index.html',
    styleUrls: ['./style.css']
})
export class LoginViewComponent {
    username: string;
    password: string;
    error: boolean = false;

    constructor(
        public router: Router,
        private authService: AuthService,
    ) {
        authService.logout();
    }

    submit() {
        let payload = {username: this.username, password: this.password};
        this.authService.login(payload)
        	.then(() => this.router.navigateByUrl('/'))
        	.catch((err) => this.error = true);
    }
}

