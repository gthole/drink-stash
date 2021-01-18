import React, { useState } from 'react';
import './style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMinus, faQuestion } from '@fortawesome/free-solid-svg-icons'
import { Button, ButtonRow } from 'components/Forms';
import { Input } from 'components/Forms';
import { RecipeFilters } from 'components/SearchBar/RecipeFilters';
import { SearchHelp } from 'components/SearchBar/SearchHelp';

export function SearchBar({value, setValue, total, subtext}) {
    const [inner, setInner] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

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
            <div className="search-bar">
                <Input
                    placeholder={placeholder}
                    value={value || inner}
                    onChange={(ev) => setInner(ev.target.value)}
                    onKeyDown={ keyDown }
                    subtext={ subtext }
                />
                <ButtonRow>
                    <Button type="clear" className="filters" onClick={ () => setShowFilters(!showFilters) }>
                        <FontAwesomeIcon icon={ showFilters ? faMinus : faPlus }/>
                    </Button>
                    <Button type="clear" className="help" onClick={ () => setShowHelp(!showHelp) }>
                        <FontAwesomeIcon icon={ faQuestion }/>
                    </Button>
                </ButtonRow>
            </div>
            <RecipeFilters
                expanded={ showFilters }
                setExpanded={ setShowFilters }
                addFilter={ (val) => setValue(val) }
            />
            <SearchHelp
                show={ showHelp }
                close={ () => setShowHelp(false) }
                setValue={ setValue }
            />
        </div>
    );
}
