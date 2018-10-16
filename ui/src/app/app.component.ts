import _ from 'lodash';
import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'Drink Stash';
    loggedIn: boolean = false;

    constructor(
        private authService: AuthService,
        private location: Location,
        private router: Router,
    ) {
        if (!this.authService.isLoggedIn()) {
            this.router.navigateByUrl('/login');
        } else {
            this.loggedIn = true;
        }

        this.authService.authUpdates.subscribe(state => this.loggedIn = state);
    }

    hasHistory(): boolean {
        // TODO: Fix this
        return !this.location.isCurrentPathEqualTo('/') &&
               !this.location.isCurrentPathEqualTo('/login');
    }

    goBack() {
        this.location.back();
        // this.router.navigateByUrl(this.location.path().split('/').slice(0, -1).join('/'));
    }
}
