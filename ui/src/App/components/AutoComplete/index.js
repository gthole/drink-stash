import React, { useState } from 'react';
import './style.css';
import { remove as diacriticsRemove } from 'diacritics';
import { Input } from '../Forms';

export function AutoComplete({index, value, dataSource, setValue}) {
    const [selected, setSelected] = useState(-1);
    const [cleaned, setCleaned] = useState(null);
    const [isFocused, setIsFocused] = useState(false);

    if (!cleaned) {
        const cleaned = dataSource.reduce((res, s) => {
            const k = diacriticsRemove(s.trim()).toLowerCase()
            res[k] = s;
            return res;
        }, {});
        setCleaned(cleaned);
        return ''; // TODO check this
    }

    const suggestions = [];
    if (isFocused) {
        const cleanedVal = diacriticsRemove(value.trim()).toLowerCase();
        for (const c of Object.keys(cleaned)) {
            if (c.includes(cleanedVal)) {
                suggestions.push(cleaned[c]);
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
                onBlur={ () => setIsFocused(false) }
            />
            <div className="suggestions">
                {
                    suggestions.map((s, i) => (
                        <div
                            key={'autosuggest-' + i}
                            className={ i === selected ? 'selected' : '' }>
                            { s }
                        </div>
                    ))
                }
            </div>
        </div>
    );
}
