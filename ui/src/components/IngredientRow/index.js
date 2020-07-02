import React from 'react';
import './style.css';

export function IngredientRow({ingredients}) {
    if (!ingredients) return '';
    return (
        <div className="IngredientRow">
            {
                ingredients.map((ingredient, i) => (
                    <span key={'q-' + i}>{ingredient}</span>
                ))
            }
        </div>
    );
}
