import React from 'react';

export function Source({recipe}) {
    let book = <div>{ recipe.book.name }</div>;
    if (recipe.url) {
        book = <a href={ recipe.url }>{book}</a>
    }

    let source = '';
    if (recipe.source && recipe.book.name !== recipe.source) {
        source = <div style={{ fontSize: '12px', marginTop: '5px' }}>{ recipe.source }</div>
    }

    return (
        <div className="Source" style={{ fontStyle: 'italic', marginTop: '5px' }}>
            { book }
            { source }
        </div>
    );
}
