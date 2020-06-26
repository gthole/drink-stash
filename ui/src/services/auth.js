import decode from 'jwt-decode';
import { CacheService } from './cache';

export class AuthService {
    constructor() {
        this.cache = new CacheService();
    }

    isLoggedIn() {
        const token = this.getToken();
        return Boolean(token);
    }

    getToken() {
        return localStorage.getItem('token');
    }

    getUserData() {
        const token = this.getToken();
        if (!token) return;

        if (this.user) return this.user;
        this.user = decode(token);
        return this.user;
    }

    logout() {
        this.user = null;
        localStorage.clear();
        this.cache.clear();
    }

    login(payload) {
        return fetch('/api/v1/auth/', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {'Content-Type': 'application/json'}
        })
        .then((res: any) => res.json())
        .then((res: any) => localStorage.setItem('token', res.token));
    }
}
