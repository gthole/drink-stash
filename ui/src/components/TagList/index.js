import React from 'react';
import './style.css';

export function TagList({tags}) {
    return (
        <div className="TagList">
            {
                tags.map((t, i) => (
                    <span key={'tag-' + i}>{ t }</span>
                ))
            }
        </div>
    );
}
