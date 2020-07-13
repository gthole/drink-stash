import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ActivityRow } from 'components/Activity/ActivityRow';
import { AppContext } from 'context/AppContext';

// A user made a comment
export function CommentActivity({ comments, showTitle }) {
    const { currentUser } = useContext(AppContext);

    if (comments.length === 0) {
        return '';
    }

    const comment = comments[0];

    let edit;
    if (comment.user.id === currentUser.user_id) {
        edit = <Link to={ `/comments/${comment.id}` }>(edit)</Link>;
    }

    let body;
    if (showTitle) {
        body = (
            <div>
                <Link to={ `/recipes/${ comment.recipe.slug }` }>{ comment.recipe.name }</Link>
                <div>{ comment.text }</div>
            </div>
        );
    } else {
        body = <div>{ comment.text }</div>
    }
    const header = <span>made a comment { edit }</span>

    return (
        <ActivityRow
            user={ comment.user }
            text={ header }
            date={ comment.created }
            body={ body }
        />
    );
}
