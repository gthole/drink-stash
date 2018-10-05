import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Subject } from 'rxjs';

@Injectable()
export class AuthService {
    constructor(
        private http: HttpClient,
    ) { }

    private loggedInState = new Subject<boolean>();
    authUpdates = this.loggedInState.asObservable();

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    getToken(): string {
        return localStorage.getItem('token');
    }

    logout(): void {
        localStorage.clear();
        this.loggedInState.next(false);
    }

    login(payload: {username: string, password: string}): Promise<any> {
        return this.http
            .post('/api/v1/auth/', payload)
            .toPromise()
            .then((res: any) => {
                localStorage.setItem('token', res.token)
                this.loggedInState.next(true);
            });
    }
}
