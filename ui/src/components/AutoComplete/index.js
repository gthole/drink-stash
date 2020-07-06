import React, { useState } from 'react';
import './style.css';
import { remove as diacriticsRemove } from 'diacritics';
import { Input } from 'components/Forms';

export function AutoComplete({value, dataSource, setValue, onSelect}) {
    const [selected, setSelected] = useState(-1);
    const [isFocused, setIsFocused] = useState(false);

    const suggestions = [];
    if (isFocused && value.trim().length > 1) {
        const cleanedVal = diacriticsRemove(value.trim()).toLowerCase();
        for (const c of dataSource) {
            if (c.cleaned.includes(cleanedVal)) {
                suggestions.push(c.name);
                if (suggestions.length >= 5) {
                    break;
                }
            }
        }
    }

    function select(index) {
        if (index === 0) console.log('selecting! ' + index);
        const val = suggestions[index];
        if (!val) return;
        setValue(val);
        if (onSelect) onSelect(val);
    }

    function onKeyDown(ev) {
        switch (ev.which || ev.keyCode) {
            case 9:
                // Tab
                select(selected);
                break;
            case 13:
                // Enter/Return
                ev.preventDefault();
                select(selected);
                break;
            case 38:
                // Down Arrow
                setSelected(selected - 1);
                break;
            case 40:
                // Up Arrow
                setSelected(selected + 1);
                break;
            default:
                return;
        }
    }

    return (
        <div className="AutoComplete">
            <Input
                value={ value }
                onChange={ (ev) => setValue(ev.target.value) }
                onKeyDown={ onKeyDown }
                onFocus={ () => setIsFocused(true) }
                onBlur={ () => setTimeout(() => setIsFocused(false), 100) }
            />
            <div className="suggestions">
                {
                    suggestions.map((s, i) => (
                        <div
                            key={'autosuggest-' + i}
                            onClick={ () => select(i) }
                            className={ i === selected ? 'selected' : '' }>
                            { s }
                        </div>
                    ))
                }
            </div>
        </div>
    );
}
