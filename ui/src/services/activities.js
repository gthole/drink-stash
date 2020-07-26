import { BaseService } from './base';

export class Activity {
    constructor(payload) {
        this.group = payload.group;
        this.count = payload.count;
        this.body = payload.body;
        this.type = payload.type;
        this.last_id = payload.last_id;
        this.last_ts = payload.last_ts;
        this.list = payload.list;
        this.recipe = payload.recipe;
        this.user = payload.user;
    }

    toPayload() {
        return;
    }
}

export class ActivityService extends BaseService {
    baseUrl = '/api/v1/activities/';
    model = Activity;
}
