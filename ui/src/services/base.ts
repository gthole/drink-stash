import _ from 'lodash';
import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import 'rxjs/add/operator/toPromise';
import hash from 'object-hash';
import { stringify } from 'querystring';
import { CacheService } from './cache';


export class BaseModel {
    _hash: string;

    setHash(): void {
        this._hash = hash(this.toPayload());
    }

    isChanged(): boolean {
        return hash(this.toPayload()) !== this._hash;
    }

    toPayload() {
        throw new Error('Not implemented');
    }
}


export class BaseService {
    cacheService: CacheService;
    http: HttpClient;
    baseUrl: string;
    model: any;
    listModel: any;

    getPage(
        query: {[k: string]: string | number} = {},
        cached?: ServiceResponse<any>,
    ): Promise<ServiceResponse<any>> {
        const qs = stringify(query);
        const model = this.listModel || this.model;

        const headers: {[header: string]: string} = {};
        if (cached) {
            headers['If-Modified-Since'] = cached.fetched;
        }

        return this.http
            .get(`${this.baseUrl}?${qs}`, {headers, observe: 'response'})
            .toPromise()
            .then((res: HttpResponse<{count: number, results: any[]}>) => {
                return {
                    fetched: new Date(res.headers.get('Date')).toISOString(),
                    count: res.body.count,
                    results: res.body.results.map(a => new model(a))
                };
            })
            .catch((err) => {
                if (err.status === 304) {
                    return Promise.resolve(cached);
                }
            });
    }

    getById(id: number | string): Promise<any> {
        return this.http
            .get(this.baseUrl + id + '/')
            .toPromise()
            .then((res) => new this.model(res));
    }

    create(obj: any): Promise<any> {
        let payload = obj.toPayload();
        return this.http
            .post(this.baseUrl, payload)
            .toPromise()
            .then((res) => new this.model(res));
    }

    update(obj: any): Promise<any> {
        let payload = obj.toPayload();
        return this.http
            .put(this.baseUrl + obj.id + '/', payload)
            .toPromise()
            .then((res) => new this.model(res));
    }

    remove(obj: any): Promise<any> {
        this.cacheService.clear();
        return this.http
            .delete(this.baseUrl + obj.id + '/')
            .toPromise();
    }
}

export class BaseReadOnlyService {
    http: HttpClient;
    baseUrl: string;
    lastResponse: ServiceResponse<any>;

    getPage(): Promise<{results: any[]}> {
        const headers: {[header: string]: string} = {};
        if (this.lastResponse) {
            headers['If-Modified-Since'] = this.lastResponse.fetched;
        }

        return this.http
            .get(this.baseUrl, {headers, observe: 'response'})
            .toPromise()
            .then((res: any) => {
                this.lastResponse = {
                    fetched: new Date(res.headers.get('Date')).toISOString(),
                    count: res.body.count,
                    results: res.body.results
                };
                return this.lastResponse;
            })
            .catch((err) => {
                if (err.status === 304) {
                    return Promise.resolve(this.lastResponse);
                }
            });
    }
}
