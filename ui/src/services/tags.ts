import { HttpClient } from "@angular/common/http";
import { URLSearchParams } from "@angular/http";
import { Injectable } from '@angular/core';

@Injectable()
class TagService {

    constructor(
        public http: HttpClient,
    ) {}

    baseUrl = '/api/v1/tags/';
    tags: string[];

    getPage(): Promise<{results: string[]}> {
        if (this.tags) return Promise.resolve({results: this.tags});

        return this.http
            .get(this.baseUrl)
            .toPromise()
            .then((res: any) => {
                this.tags = res.results;
                return {results: res.results};
            });
    }
}

export { TagService };
