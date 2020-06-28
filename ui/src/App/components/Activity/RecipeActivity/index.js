import React from 'react';
import { ActivityRecipeCards } from '../ActivityRecipeCards';
import { ActivityRow } from '../ActivityRow';

// A user created one or more recipes
export function RecipeActivity({ recipes, showTitle }) {
    if (recipes.length === 0) {
        return '';
    }

    let header;
    if (recipes.length === 1) {
        header = <span>added { showTitle ? 'a' : 'this' } recipe</span>;
    } else {
        header = <span>added { recipes.length } recipes</span>;
    }

    return (
        <ActivityRow
            user={ recipes[0].added_by }
            text={ header }
            date={ recipes[0].created }
            body={ <ActivityRecipeCards recipes={recipes} show={showTitle}/> }
        />
    );
}
