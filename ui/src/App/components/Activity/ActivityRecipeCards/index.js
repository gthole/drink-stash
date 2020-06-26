import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export function CardRow({ recipe }) {
    return (
        <div className="CardRow">
            <Link to={ `/recipes/${recipe.slug}` }>{ recipe.name }</Link>
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

export function ActivityRecipeCards({ recipes, show }) {
    const [expanded, setExpanded] = useState(false);
    if (!show) return '';

    const rows = expanded ? recipes : recipes.slice(0, 1);
    return (
        <div className="ActivityRecipeCards">
            { rows.map((r, i) => <CardRow key={'arc-' + i} recipe={r} />) }
            {
                recipes.length > 1 ?
                <div onClick={() => setExpanded(!expanded)}>
                    { expanded ? 'show less' : 'show all' }
                </div> :
                ''
            }
        </div>
    );
}
