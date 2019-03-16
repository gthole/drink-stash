import { HttpClient } from "@angular/common/http";
import { URLSearchParams } from "@angular/http";
import { Injectable } from '@angular/core';

@Injectable()
class TagService {

    constructor(
        public http: HttpClient,
    ) {}

    baseUrl = '/api/v1/tags/';
    tagsResp: ServiceResp<string>;

    getPage(): Promise<{results: string[]}> {
        const headers: {[header: string]: string} = {};
        if (this.tagsResp) {
            headers['If-Modified-Since'] = this.tagsResp.fetched;
        }

        return this.http
            .get(this.baseUrl, {headers, observe: 'response'})
            .toPromise()
            .then((res: any) => {
                return {
                    fetched: new Date(res.headers.get('Date')).toISOString(),
                    count: res.body.count,
                    results: res.body.results
                };
            });
            .catch((err) => {
                if (err.status === 304) {
                    return Promise.resolve(this.tagsResp);
                }
            });
    }
}

export { TagService };
