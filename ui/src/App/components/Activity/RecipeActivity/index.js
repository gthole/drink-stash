import React from 'react';
import { ActivityRecipeCards } from '../ActivityRecipeCards';
import { ActivityHeader } from '../ActivityHeader';

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
        <div className="RecipeActivity activity">
            <ActivityHeader
                user={ recipes[0].added_by }
                text={ header }
                date={ recipes[0].created }
            />
            <ActivityRecipeCards recipes={recipes} show={showTitle}/>
        </div>
    );
}
