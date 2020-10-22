import { BaseService } from './base';

class TagService extends BaseService {
    baseUrl = '/api/v1/tags/';
    cachePeriod = 60 * 60 * 1000;
}

export { TagService };
