import React, { useState } from 'react';
import './style.css';
import { Link } from 'react-router-dom';
import { Button } from 'components/Forms';

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

export function ActivityRecipeCards({ rows, show }) {
    const [expanded, setExpanded] = useState(false);
    if (!show) return '';

    const displayRows = expanded ? rows : rows.slice(0, 1);
    return (
        <div className="ActivityRecipeCards">
            { displayRows.map((r, i) => <CardRow key={'arc-' + i} {...r} />) }
            {
                rows.length > 1 ?
                <Button type="outline small" onClick={() => setExpanded(!expanded)}>
                    { expanded ? 'show less' : 'show all' }
                </Button> :
                ''
            }
        </div>
    );
}
