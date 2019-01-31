import { HttpRequest, HttpHandler, HttpInterceptor, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';
import _ from 'lodash';
import 'rxjs/add/operator/do';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private token: string;

    constructor(
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
            // Catch unauthorized errors and force the app to logout
            if (err instanceof HttpErrorResponse && err.status === 401) {
                this.authService.logout();
                this.router.navigateByUrl('/login');
            }
        });
    }
}
