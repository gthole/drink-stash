import React from 'react';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';

export function ActivityHeader({text, user, date}) {
    const name = `${user.first_name} ${user.last_name}`;

    // TODO:  user.image || '/static/img/generic.png'
    return (
        <div className="ActivityHeader">
            <div className="activity-header-img">
                <img
                    src="/static/img/generic.png"
                    alt={ name }
                />
            </div>
            <div className="activity-header-text">
                <div className="activity-header-content">
                    <Link className="activity-header-userlink" to={ `/users/${ user.username }` }>
                        { name }
                    </Link>
                    { text }
                </div>
                <div className="activity-header-date">
                    { DateTime.fromISO(date).toRelative() }
                </div>
            </div>
        </div>
    );
}
