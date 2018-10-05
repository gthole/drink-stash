import { HttpClient } from "@angular/common/http";
import { URLSearchParams } from "@angular/http";
import { Injectable } from '@angular/core';
import { BaseModel, BaseService } from './base';
import { AuthService } from './auth';

class User extends BaseModel {
    id: string;
    first_name: string;

    constructor(payload) {
        super();
        this.id = payload.id;
        this.first_name = payload.first_name;

        this.setHash();
    }

    toPayload() {
        return {
            id: this.id,
            first_name: this.first_name
        }
    }
}

@Injectable()
class UserService extends BaseService {

    constructor(
        public http: HttpClient,
        public authService: AuthService,
    ) { super(); }

    baseUrl = '/api/v1/users/';
    model = User;
}

export { User, UserService };
