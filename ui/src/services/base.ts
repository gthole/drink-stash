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


interface CacheContent {
    values: any[];
    date: number;
}

export class BaseService {

    http: HttpClient;
    baseUrl: string;
    model: any;
    listModel: any;

    getPage(query?: {[k: string]: string | number}): Promise<{count: number, results: any[]}> {
        const qs = stringify(query || {});
        const model = this.listModel || this.model;

        return this.http
            .get(`${this.baseUrl}?${qs}`)
            .toPromise()
            .then((resp: {count: number, results: any[]}) => {
                return {
                    count: resp.count,
                    results: resp.results.map(a => new model(a))
                };
            });
    }

    getById(id: number): Promise<any> {
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
