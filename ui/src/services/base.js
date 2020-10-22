import { stringify } from 'querystring';
import { AuthService } from './auth';
import { CacheService } from './cache';

export class BaseService {
    cachePeriod = 10 * 1000;

    constructor() {
        this.cacheService = new CacheService();
        this.authService = new AuthService();
    }

    getPage(query) {
        const model = this.listModel || this.model;
        const qs = stringify(query);
        const url = `${this.baseUrl}?${qs}`

        function format(response) {
            if (model) {
                response.results = response.results.map(a => new model(a));
            }
            return response;
        }

        let cached = this.cacheService.get(url);
        const headers = this.getHeaders();
        if (cached) {
            if (Date.now() - cached.fetched < this.cachePeriod) {
                return Promise.resolve(format(cached));
            }
            headers['If-Modified-Since'] = new Date(cached.fetched).toISOString();
            headers['X-Count'] = '' + cached.count;
        }

        return this.request(url, {headers}).then(async (res) => {
            if (res.status === 304) {
                // Re-store the with an updated fetched time
                this.cacheResults(url, res, cached);
                return format(cached);
            }
            const body = await res.json();
            const response = {
                count: body.count,
                results: body.results
            };
            this.cacheResults(url, res, response);
            return format(response);
        });
    }

    cacheResults(url, res, results) {
        results.fetched = new Date(res.headers.get('Date')).valueOf();
        this.cacheService.set(url, results);
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
