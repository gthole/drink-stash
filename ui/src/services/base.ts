import _ from 'lodash';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AuthService } from './auth';
import 'rxjs/add/operator/toPromise';
import hash from 'object-hash';

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

    authService: AuthService;
    http: HttpClient;
    baseUrl: string;
    model: any;
    cached: any[];
    expire: number = 0;

    getCache(): any[] {
        if (this.cached && this.expire > Date.now()) {
        	return _.cloneDeep(this.cached);
        }
    }

    setCache(cache: any[]) {
        this.cached = cache;
        this.expire = Date.now() + (60 * 60 * 1000);
    }

    getList(): Promise<any[]> {
        const cached = this.getCached();
        if (cached) {
            return new Promise((res) => res(cached));
        }

        return this.http
            .get(this.baseUrl)
            .toPromise()
            .then((resp: any[]) => {
                const result = resp.map(a => new this.model(a));
        		this.setCache(result);
                return result;
            });
    }

    getById(id: string): Promise<any> {
    	const cached = this.getCache();
        if (cached) {
            const r = cached.filter(a => a.id == parseInt(id, 10));
            if (r.length) {
                return new Promise((res) => res(r[0]));
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
            .then((res) => new this.model(res));
    }

    update(obj: any): Promise<any> {
        this.cached = null;
        let payload = obj.toPayload();
        return this.http
            .put(this.baseUrl + obj.id + '/', payload)
            .toPromise()
            .then((res) => new this.model(res));
    }

    remove(obj: any): Promise<any> {
        this.cached = null;
        return this.http
            .delete(this.baseUrl + obj.id + '/')
            .toPromise();
    }
}
