import { Injectable } from '@angular/core';

// Local Storage cache lives for 3 days
const EXPIRY = 3 * 24 * 60 * 60 * 1000;

@Injectable()
export class CacheService {
    constructor(
    ) { }

    set(name: string, value: any): void {
        localStorage.setItem(name, JSON.stringify(value));
    }

    get(name: string): any {
        const item = localStorage.getItem(name);
        if (!item) return;
        return JSON.parse(item);
    }

    remove(name): void {
        localStorage.clearItem(name);
    }

    /*
     * A sensible check on the cache to prevent it getting too big - check
     * whenever we load the app, and if it's been more than three days, blow
     * away the cache
     */
    checkClear(): void {
        const stamp = localStorage.getItem('_stamp');
        if (stamp && Date.now() - new Date(stamp).valueOf() > EXPIRY) {
            const token = localStorage.getItem('token');
            localStorage.clear();
            localStorage.setItem('token', token);
        }
        localStorage.setItem('_stamp', new Date().toISOString());
    }
}
