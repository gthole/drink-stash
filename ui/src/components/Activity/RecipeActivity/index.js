import React from 'react';
import { ActivityRecipeCards } from 'components/Activity/ActivityRecipeCards';
import { ActivityRow } from 'components/Activity/ActivityRow';

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
    const rows = recipes.map((recipe) => ({recipe, user: recipe.added_by}));

    return (
        <ActivityRow
            user={ recipes[0].added_by }
            text={ header }
            date={ recipes[0].created }
            body={ <ActivityRecipeCards rows={rows} show={showTitle}/> }
        />
    );
}
