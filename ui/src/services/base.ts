import { stringify } from 'querystring';
import { AuthService } from './auth';
import { CacheService } from './cache';

interface ServiceResponse<K> {
    fetched: string;
    count: number;
    results: K[];
}

export abstract class BaseModel {
    abstract toPayload(): {[k: string]: any};
}

export abstract class BaseService {
    protected cacheService: CacheService = new CacheService();
    protected authService: AuthService = new AuthService();
    // private csrfToken: string;

    protected abstract baseUrl: string;
    protected model: any = null;

    constructor() {
        /*
        this.csrfToken = _.fromPairs(document.cookie.split('; ').map(
            (c) => c.split('=')
        )).csrftoken;
         */
    }

    getPage(query: any): Promise<ServiceResponse<any> | undefined> {
        const model: any = this.model;
        const qs = stringify(query);
        const url = `${this.baseUrl}?${qs}`

        let cached = this.cacheService.get(url);
        const headers: {[header: string]: string} = this.getHeaders();
        if (cached) {
            headers['If-Modified-Since'] = cached.fetched;
            headers['X-Count'] = '' + cached.count;
        }

        function format(response: ServiceResponse<any>): ServiceResponse<any> {
            if (model) {
                response.results = response.results.map(a => new model(a));
            }
            return response;
        }

        return fetch(url, {headers})
            .then((res) => res.json())
            .then((res) => {
                const response = {
                    fetched: new Date(res.headers.get('Date')).toISOString(),
                    count: res.body.count,
                    results: res.body.results
                };
                this.cacheService.set(url, response);
                return format(response);
            })
            .catch((err) => {
                if (err.status === 304 && cached) {
                    return format(cached);
                }
            });
    }

    getById(id: number | string): Promise<any> {
        return fetch(`${this.baseUrl}${id}/`, {
            headers: this.getHeaders()
        })
        .then(res => res.json())
        .then(res => new this.model(res));
    }

    create(obj: any): Promise<any> {
        const payload = obj.toPayload();
        return fetch(this.baseUrl, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(res => new this.model(res));
    }

    update(obj: any): Promise<any> {
        const payload = obj.toPayload();
        return fetch(`${this.baseUrl}${obj.id}/`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(res => new this.model(res));
    }

    remove(obj: any): Promise<any> {
        return fetch(`${this.baseUrl}${obj.id}/`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });
    }

    protected getHeaders() {
        return {
            Authorization: 'JWT ' + this.authService.getToken(),
            // 'X-CSRFToken': this.token
        };
    }
}
