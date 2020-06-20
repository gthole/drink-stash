import React, { useState } from 'react';
import './style.css';

export function SearchBar({value, setValue, total}) {
    const [inner, setInner] = useState('');

    function keyDown(ev) {
        const key = ev.keyCode || ev.which;
        if (key === 13) {
            setValue(inner);
            setInner('');
        }
    }

    const placeholder = total ? `Search ${total} recipes` : '';

    return (
        <div className="SearchBar">
            <input
                placeholder={placeholder}
                value={value || inner}
                onChange={(ev) => setInner(ev.target.value)}
                onKeyDown={keyDown}
            />
        </div>
    );
}
