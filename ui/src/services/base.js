import { stringify } from 'querystring';
import { AuthService } from './auth';
import { CacheService } from './cache';

export class BaseService {
    constructor() {
        this.cacheService = new CacheService();
        this.authService = new AuthService();
        /*
        this.csrfToken = _.fromPairs(document.cookie.split('; ').map(
            (c) => c.split('=')
        )).csrftoken;
         */
    }

    getPage(query) {
        const model = this.listModel || this.model;
        const qs = stringify(query);
        const url = `${this.baseUrl}?${qs}`

        let cached = this.cacheService.get(url);
        const headers = this.getHeaders();
        if (cached) {
            headers['If-Modified-Since'] = cached.fetched;
            headers['X-Count'] = '' + cached.count;
        }

        function format(response) {
            if (model) {
                response.results = response.results.map(a => new model(a));
            }
            return response;
        }

        return this.request(url, {headers}).then(async (res) => {
            if (res.status === 304) {
                return format(cached);
            }
            const body = await res.json();
            const response = {
                fetched: new Date(res.headers.get('Date')).toISOString(),
                count: body.count,
                results: body.results
            };
            this.cacheService.set(url, response);
            return format(response);
        });
    }

    getById(id) {
        return this.request(`${this.baseUrl}${id}/`, {
            headers: this.getHeaders()
        })
        .then(res => res.json())
        .then(res => new this.model(res));
    }

    create(obj) {
        const payload = obj.toPayload();
        return this.request(this.baseUrl, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(res => new this.model(res));
    }

    update(obj) {
        const payload = obj.toPayload();
        return this.request(`${this.baseUrl}${obj.id}/`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(res => new this.model(res));
    }

    removeById(id) {
        return this.request(`${this.baseUrl}${id}/`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });
    }

    remove(obj) {
        return this.removeById(obj.id);
    }

    request(url, options) {
        return fetch(url, options)
            .then((res) => {
                if (res.status >= 400) throw res;
                return res;
            })
    }

    getHeaders() {
        return {
            Authorization: 'JWT ' + this.authService.getToken(),
            'Content-Type': 'application/json',
            // 'X-CSRFToken': this.token
        };
    }
}
