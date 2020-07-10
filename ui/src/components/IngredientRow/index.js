import React from 'react';
import './style.css';

export function IngredientRow({ingredients}) {
    if (!ingredients) return '';
    // Use React.Fragment here to prevent crazy line breaks due to stacking
    // spans together without spaces between them
    return (
        <div className="IngredientRow">
            {
                ingredients.map((ingredient, i) => (
                    <React.Fragment>
                        <span key={'q-' + i}>{ingredient}</span>
                        { ' ' }
                    </React.Fragment>
                ))
            }
        </div>
    );
}
