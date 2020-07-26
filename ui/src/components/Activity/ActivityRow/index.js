import React from 'react';
import './style.css';
import { stringify } from 'querystring';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import { Button } from 'components/Forms';
import { ProfileImage } from 'components/ProfileImage';

export function ActivityRow({activity, text, body, className}) {
    const name = `${activity.user.first_name} ${activity.user.last_name}`;
    let ts = DateTime.fromISO(activity.last_ts).toRelative();
    if (ts === 'in 0 seconds') ts = 'just now';

    let search;
    if (activity.count > 1) {
        const s = new Date(activity.group);
        const params = {
            created__gte: s.toISOString(),
            created__lt: new Date(s.valueOf() + (60 * 60 * 1000)).toISOString()
        };
        if (activity.type === 'recipe') {
            params.added_by = activity.user.id;
        } else if (activity.type === 'listrecipe') {
            params.user_list__user_id = activity.user.id;
        }
        search = stringify(params);
    }

    return (
        <div className={'ActivityRow ' + (className || '')}>
            <div className="activity-header-img">
                <ProfileImage user={ activity.user } size={ 52 }/>
            </div>
            <div className="activity-header-text">
                <div className="activity-header-content">
                    <Link
                            className="activity-header-userlink"
                            to={ `/users/${ activity.user.username }` }>
                        { name }
                    </Link>
                    { text }
                </div>
                <div className="activity-header-date">
                    { ts }
                </div>
                <div className="activity-body">
                    { body }
                </div>
                {
                    activity.count > 1 ?
                    <div className="activity-details-link">
                        <Button
                            type="outline small"
                            to={{
                                pathname: `/activities/${ activity.type }`,
                                search: search
                            }}
                            children="show all"
                        />
                    </div> :
                    ''
                }
            </div>
        </div>
    );
}
