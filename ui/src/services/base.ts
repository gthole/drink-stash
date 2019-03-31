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

    getPage(query: QueryParams = {}): Promise<ServiceResponse<any>> {
        const model = this.listModel || this.model;

        const qs = stringify(query);
        const url = `${this.baseUrl}?${qs}`

        let cached = this.cacheService.get(url);
        const headers: {[header: string]: string} = {};
        if (cached) {
            headers['If-Modified-Since'] = cached.fetched;
            headers['X-Count'] = '' + cached.count;
        }

        return this.http
            .get(url, {headers, observe: 'response'})
            .toPromise()
            .then((res: HttpResponse<{count: number, results: any[]}>) => {
                const response = {
                    fetched: new Date(res.headers.get('Date')).toISOString(),
                    count: res.body.count,
                    results: res.body.results
                };
                if (model) {
                    response.results = response.results
                        .map((a) => new model(a));
                }
                this.cacheService.set(url, response);
                return response;
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
        return this.http
            .delete(this.baseUrl + obj.id + '/')
            .toPromise();
    }
}
