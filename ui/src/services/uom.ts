import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { CacheService } from './cache';
import { BaseService } from './base';

@Injectable()
class UomService extends BaseService {

    constructor(
        public http: HttpClient,
        public cacheService: CacheService,
    ) { super(); }

    baseUrl = '/api/v1/uom/';
}

export { UomService };
