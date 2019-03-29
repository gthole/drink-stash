import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { CacheService } from './cache';
import { BaseReadOnlyService } from './base';

@Injectable()
class UomService extends BaseReadOnlyService {

    constructor(
        public http: HttpClient,
        public cacheService: CacheService,
    ) { super(); }

    baseUrl = '/api/v1/uom/';
}

export { UomService };
