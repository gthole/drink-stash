import { CacheService } from './cache';
import { BaseService, BaseModel } from './base';

export class Book extends BaseModel {
    id: number;
    name: string;

    constructor(payload: any) {
        super();
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

export class BookService<Book> extends BaseService {
    baseUrl = '/api/v1/books/';
    model = Book;
}
