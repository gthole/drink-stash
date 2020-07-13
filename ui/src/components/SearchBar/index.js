import React, { useState } from 'react';
import './style.css';
import { Input } from 'components/Forms';

export function SearchBar({value, setValue, total, subtext}) {
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
            <Input
                placeholder={placeholder}
                value={value || inner}
                onChange={(ev) => setInner(ev.target.value)}
                onKeyDown={ keyDown }
                subtext={ subtext }
            />
        </div>
    );
}
