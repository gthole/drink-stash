import { BaseService } from './base';

class UomService extends BaseService {
    baseUrl = '/api/v1/uom/';
    cachePeriod = 60 * 60 * 1000;
}

export { UomService };
