import _ from 'lodash';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import 'rxjs/add/operator/toPromise';
import hash from 'object-hash';
import { stringify } from 'querystring';


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


const CACHE_TTL = 60 * 60 * 1000;


interface CacheContent {
    values: any[];
    date: number;
}

export class BaseService {

    http: HttpClient;
    baseUrl: string;
    model: any;
    cached: CacheContent;

    getCache(): CacheContent {
        if (this.cached) return this.cached;
        const cached = localStorage.getItem(this.baseUrl);
        if (cached) {
            this.cached = JSON.parse(cached);
            return this.cached;
        }
    }

    setCache(date: number, values: any[]) {
        this.cached = {date, values};
        localStorage.setItem(this.baseUrl, JSON.stringify(this.cached));
    }

    clearCache() {
        this.cached = null;
        localStorage.removeItem(this.baseUrl);
    }

    getFiltered(query: {[k: string]: string}): Promise<any[]> {
        const qs = stringify(query);
        return this.http
            .get(`${this.baseUrl}?${qs}`)
            .toPromise()
            .then((resp: any[]) => resp.map(a => new this.model(a)));
    }

    getList(): Promise<any[]> {
        // Take a look at our live cache
        const cached = this.getCache();
        if (cached && Date.now() < cached.date + CACHE_TTL) {
            return new Promise((r) => r(cached.values.map(a => new this.model(a))));
        }

        // If the cache doesn't exist or isn't fresh enough,
        const headers: {[header: string]: string} = {};
        if (cached) {
            headers['If-Modified-Since'] = new Date(cached.date).toISOString();
        }

        return this.http
            .get(this.baseUrl, {headers})
            .toPromise()
            .then((resp: any[]) => {
                const result = resp.map(a => new this.model(a));
                // TODO: Use Date header from response
                this.setCache(Date.now(), resp);
                return result;
            })
            .catch((response) => {
                // TODO: Throw error if not 304
                if (response.status === 304) {
                    this.cached.date = Date.now();
                    return cached.values.map(a => new this.model(a));
                }
            });
    }

    getById(id: string): Promise<any> {
        const cached = this.getCache();
        if (cached && Date.now() < cached.date + CACHE_TTL) {
            const r = cached.values.filter(a => a.id == parseInt(id, 10));
            if (r.length) {
                return new Promise((res) => res(new this.model(r[0])));
            }
        }
        return this.http
            .get(this.baseUrl + id + '/')
            .toPromise()
            .then((res) => new this.model(res));
    }

    create(obj: any): Promise<any> {
        this.cached = null;
        let payload = obj.toPayload();
        return this.http
            .post(this.baseUrl, payload)
            .toPromise()
            .then((res) => {
                this.clearCache();
                return new this.model(res);
            });
    }

    update(obj: any): Promise<any> {
        this.cached = null;
        let payload = obj.toPayload();
        return this.http
            .put(this.baseUrl + obj.id + '/', payload)
            .toPromise()
            .then((res) => {
                this.clearCache();
                return new this.model(res);
            });
    }

    remove(obj: any): Promise<any> {
        this.cached = null;
        return this.http
            .delete(this.baseUrl + obj.id + '/')
            .toPromise()
            .then(() => this.clearCache());
    }
}
