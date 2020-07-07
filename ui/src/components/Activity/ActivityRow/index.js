import React from 'react';
import './style.css';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import { ProfileImage } from 'components/ProfileImage';

export function ActivityRow({text, user, date, body, className}) {
    const name = `${user.first_name} ${user.last_name}`;
    let ts = DateTime.fromISO(date).toRelative();
    if (ts === 'in 0 seconds') ts = 'just now';

    return (
        <div className={'ActivityRow ' + (className || '')}>
            <div className="activity-header-img">
                <ProfileImage user={ user } size={ 52 }/>
            </div>
            <div className="activity-header-text">
                <div className="activity-header-content">
                    <Link className="activity-header-userlink" to={ `/users/${ user.username }` }>
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
            </div>
        </div>
    );
}
