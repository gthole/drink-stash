import React from 'react';
import './style.css';

export function SearchBar({value, setValue}) {
    return (
        <div className="SearchBar">
            <input
                value={value || ''}
                onChange={(ev) => setValue(ev.target.value)}
            />
        </div>
    );
}
