import { HttpClient } from "@angular/common/http";
import { URLSearchParams } from "@angular/http";
import { Injectable } from '@angular/core';

@Injectable()
class UomService {

    constructor(
        public http: HttpClient,
    ) {}

    baseUrl = '/api/v1/uom/';
    uomResp: ServiceResponse<string>;

    getPage(): Promise<{results: string[]}> {
        const headers: {[header: string]: string} = {};
        if (this.uomResp) {
            headers['If-Modified-Since'] = this.uomResp.fetched;
        }

        return this.http
            .get(this.baseUrl, {headers, observe: 'response'})
            .toPromise()
            .then((res: any) => {
                this.uomResp = {
                    fetched: new Date(res.headers.get('Date')).toISOString(),
                    count: res.body.count,
                    results: res.body.results
                };
                return this.uomResp;
            })
            .catch((err) => {
                if (err.status === 304) {
                    return Promise.resolve(this.uomResp);
                }
            });
    }
}

export { UomService };
