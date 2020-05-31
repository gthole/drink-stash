import { JwtHelperService } from '@auth0/angular-jwt';
import { CacheService } from './cache';

const helper = new JwtHelperService();

interface UserData {

}

export class AuthService {
    cache: CacheService = new CacheService();

    isLoggedIn(): boolean {
        const token = this.getToken();
        return Boolean(token) && !helper.isTokenExpired(token as string);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    getUserData(): any {
        return helper.decodeToken(this.getToken() as string);
    }

    logout(): void {
        localStorage.clear();
        this.cache.clear();
    }

    login(payload: {username: string, password: string}): Promise<any> {
        return fetch('/api/v1/auth/', {
            method: 'POST',
            body: JSON.stringify(payload)
        })
        .then((res: any) => res.json())
        .then((res: any) => localStorage.setItem('token', res.token));
    }
}
