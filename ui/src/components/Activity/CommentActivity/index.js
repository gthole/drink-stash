import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ActivityRow } from 'components/Activity/ActivityRow';
import { AppContext } from 'context/AppContext';

// A user made a comment
export function CommentActivity({ activity, showTitle }) {
    const { currentUser } = useContext(AppContext);

    let edit;
    if (activity.user.id === currentUser.user_id) {
        edit = <Link to={ `/comments/${activity.last_id}` }>(edit)</Link>;
    }

    let body;
    if (showTitle) {
        body = (
            <div>
                <Link to={ `/recipes/${ activity.recipe.slug }` }>{ activity.recipe.name }</Link>
                <div>{ activity.body }</div>
            </div>
        );
    } else {
        body = <div>{ activity.body }</div>
    }
    const header = <span>made a comment { edit }</span>

    return (
        <ActivityRow
            activity={ activity }
            text={ header }
            body={ body }
        />
    );
}
