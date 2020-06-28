import React from 'react';
import './style.css';
import { Card } from '../../../components/Card';

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
            <div className="recipe-ingredient">
                {
                    recipe.ingredients.map((ingredient, i) => (
                        <span key={'q-' + i}>{ingredient}</span>
                    ))
                }
            </div>
            <div className="recipe-tags">
                {
                    recipe.tags.map((t, i) => (
                        <span key={'tag-' + i}>{ t }</span>
                    ))
                }
            </div>
        </Card>
    )
}
