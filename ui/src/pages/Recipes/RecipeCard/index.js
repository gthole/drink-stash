import React from 'react';
import './style.css';
import { Card } from 'components/Card';
import { IngredientRow } from 'components/IngredientRow';
import { TagList } from 'components/TagList';

export function RecipeCard({recipe, selectRecipe, onClick}) {
    let comments = '';
    if (recipe.comment_count > 0) {
        comments = (
            <div className="comment-count">
                { recipe.comment_count }
            </div>
        );
    }

    return (
        <Card className="RecipeCard" onClick={onClick}>
            { comments }
            <div className="recipe-name">
                { recipe.name }
            </div>
            <IngredientRow ingredients={ recipe.ingredients } />
            <TagList tags={ recipe.tags } />
        </Card>
    )
}
