import React from 'react';
import { Link } from 'react-router-dom';
import { ActivityHeader } from '../ActivityHeader';
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

    let header;
    if (showTitle) {
        header = (
            <span>
                commented on <Link to={ `/recipes/${ comment.recipe.slug }` }>{ comment.recipe.name }</Link> { edit }
            </span>
        );
    } else {
        header = edit;
    }

    return (
        <div className="ListRecipeActivity activity">
            <ActivityHeader
                user={ comment.user }
                text={ header }
                date={ comment.created }
            />
            <div className="activity-body">{ comment.text }</div>
        </div>
    );
}
