import React from 'react';
import { Link } from 'react-router-dom';
import { ActivityRecipeCards } from '../ActivityRecipeCards';
import { ActivityHeader } from '../ActivityHeader';

// A user created one or more recipes
export function ListRecipeActivity({ listRecipes, showTitle }) {
    if (listRecipes.length === 0) {
        return '';
    }

    const lr = listRecipes[0];

    let header;
    const link = (
        <Link to={ `/users/${ lr.user.username }/lists/${ lr.list.name }` }>
            "{lr.list.name}"
        </Link>
    );
    if (listRecipes.length === 1) {
        header = <span>added { showTitle ? 'a' : 'this' } recipe to {link}</span>;
    } else {
        header = <span>added {listRecipes.length} recipes to {link}</span>;
    }
    const recipes = listRecipes.map(lr => lr.recipe);

    return (
        <div className="ListRecipeActivity activity">
            <ActivityHeader
                user={ lr.user }
                text={ header }
                date={ lr.created }
            />
            <ActivityRecipeCards show={showTitle} recipes={recipes} />
        </div>
    );
}
