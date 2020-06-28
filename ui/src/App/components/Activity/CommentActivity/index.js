import React from 'react';
import { Link } from 'react-router-dom';
import { ActivityRow } from '../ActivityRow';
import { AuthService } from '../../../../services/auth';

const authService = new AuthService();

// A user made a comment
export function CommentActivity({ comments, showTitle }) {
    if (comments.length === 0) {
        return '';
    }

    const comment = comments[0];

    let edit;
    if (comment.user.id === authService.getUserData().user_id) {
        edit = <Link to={ `/comments/${comment.id}` }>(edit)</Link>;
    }

    const body = (
        <div>
            <Link to={ `/recipes/${ comment.recipe.slug }` }>{ comment.recipe.name }</Link>
            <div>{ comment.text }</div>
        </div>
    );
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
