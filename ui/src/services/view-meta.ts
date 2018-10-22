import { Injectable } from '@angular/core';

@Injectable()
export class ViewMetaService {
    constructor(
    ) { }

    private registry: {[view: string]: any} = {};

    clear(): void {
        this.registry = {};
    }

    setMeta(view: string, meta: any): void {
        this.registry[view] = meta;
    }

    getMeta(view: string): any {
        return this.registry[view];
    }
}
