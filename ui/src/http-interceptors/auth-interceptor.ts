import { HttpRequest, HttpHandler, HttpInterceptor, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth';
import { AlertService } from '../services/alerts';
import { Router } from '@angular/router';
import _ from 'lodash';
import 'rxjs/add/operator/do';

const BADR_MSG = 'Whoops, something looks wrong with your request.  Please check it and try again.',
      AUTH_MSG = 'Hmm - what you\'re trying to do doesn\'t look right.',
      ERR_MSG = 'Darn. Something went wrong on the server.  Please try again later.';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private token: string;

    constructor(
        private alertService: AlertService,
        private authService: AuthService,
        private router: Router,
    ) {
        this.token = _.fromPairs(document.cookie.split('; ').map(
            (c) => c.split('=')
        )).csrftoken;
    }

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        const authReq = req.clone({setHeaders: {
            'X-CSRFToken': this.token,
            'Authorization': 'JWT ' + this.authService.getToken()
        }});
        return next.handle(authReq).do((ev) => {}, (err: any) => {
            switch (err.status) {
                case 304:
                    return;
                case 400:
                    // Warn the user that something looks wrong with their request
                    this.alertService.warning(BADR_MSG);
                    break;
                case 401:
                    // Catch authentication errors and force the app to logout
                    this.authService.logout();
                    this.router.navigateByUrl('/login');
                    return;
                case 403:
                    // Warn the user that they're trying to do something wrong
                    this.alertService.warning(AUTH_MSG);
                    break;
                default:
                    // Show generic error message to user
                    this.alertService.error(ERR_MSG);
                    break;
            }
            setTimeout(() => {throw err;}, 0);
        });
    }
}
