import React from 'react';

export function ListCount({ list }) {
    return (
        <div
                className="ListCount"
                style={{
                    marginTop: '10px',
                    color: '#72757a'
                }}
            >
            { list.recipe_count }&nbsp;
            { list.recipe_count === 1 ? 'Recipe' : 'Recipes' }
        </div>
    );
}
