import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { CacheService } from './cache';
import { BaseService } from './base';

export class Book {
    id: number;
    name: string;

    constructor(payload) {
        this.id = payload.id;
        this.name = payload.name;
    }

    toPayload() {
        return {
            id: this.id,
            name: this.name
        };
    }
}

@Injectable()
export class BookService extends BaseService {

    constructor(
        public http: HttpClient,
        public cacheService: CacheService,
    ) { super(); }

    baseUrl = '/api/v1/books/';
    model = Book;
}
