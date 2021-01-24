import React from 'react';
import './style.css';
import { Card } from 'components/Structure';
import { IngredientRow } from 'components/IngredientRow';
import { TagList } from 'components/TagList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookmark } from '@fortawesome/free-solid-svg-icons'

export function RecipeCard({recipe, selectRecipe, onClick}) {
    let comments = '';
    if (recipe.comment_count > 0) {
        comments = (
            <div className={ 'comment-count' + (recipe.uc_count ? ' uc' : '') }>
                { recipe.comment_count }
            </div>
        );
    }
    let ul = '';
    if (recipe.ul_count > 0) {
        ul = (
            <div className="ul-count">
                <FontAwesomeIcon icon={ faBookmark }/>
            </div>
        )
    }

    return (
        <Card className="RecipeCard" onClick={onClick}>
            <div className="badges">
                { ul }
                { comments }
            </div>
            <div className="recipe-name">
                { recipe.name }
            </div>
            <IngredientRow ingredients={ recipe.ingredients } />
            <TagList tags={ recipe.tags } />
        </Card>
    )
}
