import React from 'react';
import './style.css';
import { Link } from 'react-router-dom';

export function CardRow({ recipe, list, user }) {
    const rLink = <Link to={ `/recipes/${recipe.slug}` }>{ recipe.name }</Link>;
    return (
        <div className="ActivityRecipeCardRow">
            <div className="activity-recipe-card-row-header">
                {
                    list ?
                    <div>
                        { rLink } added to <Link
                            to={ `/users/${user.username}/lists/${list.id}` }
                            children={ list.name }
                        />
                    </div> :
                    rLink
                }
            </div>
            <div className="activity-ingredients">
                {
                    recipe.ingredients.map((i, k) => (
                        <span key={'ai-' + k}>{ i }</span>
                    ))
                }
            </div>
        </div>
    );
}
