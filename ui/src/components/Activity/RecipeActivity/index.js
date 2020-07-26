import React from 'react';
import { CardRow } from 'components/Activity/ActivityRecipeCards';
import { ActivityRow } from 'components/Activity/ActivityRow';

// A user created one or more recipes
export function RecipeActivity({ activity, showTitle }) {
    let header;
    if (activity.count === 1) {
        header = <span>added { showTitle ? 'a' : 'this' } recipe</span>;
    } else {
        header = <span>added { activity.count } recipes</span>;
    }

    return (
        <ActivityRow
            activity={ activity }
            text={ header }
            body={ <CardRow recipe={ activity.recipe } user={ activity.user }/> }
        />
    );
}
