import { HttpRequest, HttpHandler, HttpInterceptor } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth';
import _ from 'lodash';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private token: string;

    constructor(
        private authService: AuthService,
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
        return next.handle(authReq);
    }
}
