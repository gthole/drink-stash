import React from 'react';
import { Link } from 'react-router-dom';
import { CardRow } from 'components/Activity/ActivityRecipeCards';
import { ActivityRow } from 'components/Activity/ActivityRow';

// A user created one or more recipes
export function ListRecipeActivity({ activity, showTitle }) {
    let header;
    const link = (
        <Link to={ `/users/${ activity.user.username }/lists/${ activity.list.id }` }>
            "{activity.list.name}"
        </Link>
    );

    if (activity.count === 1) {
        header = <span>added { showTitle ? 'a' : 'this' } recipe to { link }</span>;
    } else {
        header = <span>added { activity.count } recipes to lists</span>;
    }

    return (
        <ActivityRow
            className="ListRecipeActivity"
            activity={ activity }
            text={ header }
            body={
                <CardRow
                    recipe={ activity.recipe }
                    user={ activity.user }
                    list={ activity.list }
                />
            }
        />
    );
}
