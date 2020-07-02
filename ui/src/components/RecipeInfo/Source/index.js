import React from 'react';

export function Source({recipe}) {
    let source = <span>{ recipe.source }</span>;
    if (recipe.url) {
        source = <a href={ recipe.url }>{source}</a>
    }

    return (
        <div
            className="Source"
            style={{ fontStyle: 'italic', marginTop: '5px' }}>
            { source }
        </div>
    );
}
