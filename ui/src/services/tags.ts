import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { BaseReadOnlyService } from './base';

@Injectable()
class TagService extends BaseReadOnlyService {

    constructor(
        public http: HttpClient,
    ) { super(); }

    baseUrl = '/api/v1/tags/';
}

export { TagService };
