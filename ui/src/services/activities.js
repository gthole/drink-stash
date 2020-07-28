import { BaseService } from './base';

export class Activity {
    constructor(payload) {
        this.count = payload.count;
        this.body = payload.body;
        this.type = payload.type;
        this.last_id = payload.id;
        this.last_ts = payload.created;
        this.list = payload.user_list;
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
