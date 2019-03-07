import _ from 'lodash';
import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from '../services/auth';
import { AlertService } from '../services/alerts';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'Drink Stash';
    loggedIn: boolean = false;
    userId: number;
    alerts: Alert[] = [];

    constructor(
        private authService: AuthService,
        private alertService: AlertService,
        private location: Location,
        private router: Router,
    ) {
        if (!this.authService.isLoggedIn()) {
            this.router.navigateByUrl('/login');
        } else {
            const data = this.authService.getUserData();
            this.userId = data.user_id;
            this.loggedIn = true;
        }

        this.alertService.alertTopic.subscribe(alrt => this.alerts.push(alrt));
        this.authService.authUpdates.subscribe(state => this.loggedIn = state);
    }

    hasHistory(): boolean {
        return !this.location.isCurrentPathEqualTo('/') &&
               !this.location.isCurrentPathEqualTo('/login');
    }

    dismiss(ev, i) {
        ev.preventDefault();
        this.alerts.splice(i, 1);
    }

    goBack() {
        this.location.back();
    }
}
