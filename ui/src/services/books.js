import { BaseService } from './base';

export class Book {
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

export class BookService extends BaseService {
    baseUrl = '/api/v1/books/';
    model = Book;
}
