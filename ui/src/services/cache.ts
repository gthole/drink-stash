import { Injectable } from '@angular/core';

@Injectable()
export class CacheService {
    constructor(
    ) { }

    // Going to local storage presents serialization problems (e.g. Dates)
    registry: {[k: string]: any} = {};

    clear(): void {
        this.registry = {};
    }

    set(name: string, value: any): void {
        this.registry[name] = value;
    }

    get(name: string): any {
        return this.registry[name];
    }
}
