import React, { useState } from 'react';
import './style.css';
import { AutoComplete } from 'components/AutoComplete';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

export function TagList({tags}) {
    return (
        <div className="TagList">
            {
                tags.map((t, i) => (
                    <span
                        key={'tag-' + i}
                        children={ t }
                    />
                ))
            }
        </div>
    );
}

export function TagListEdit({tags, setTags, sourceTags}) {
    const [value, setValue] = useState('');

    return (
        <div className="TagListEdit">
            <TagList
                tags={ tags.map((t, i) => (
                    <React.Fragment key={ i }>
                        { t }
                        <FontAwesomeIcon
                            icon={ faTimes }
                            onClick={ () => setTags(tags.filter(tag => t !== tag)) }
                        />
                    </React.Fragment>
                ))}
            />
            <AutoComplete
                value={ value }
                setValue={ (val) => setValue(val) }
                onSelect={ (val) => {
                    setTags(tags.concat([val]));
                    setValue('');
                }}
                dataSource={ sourceTags.map((t) => ({
                    name: t,
                    cleaned: t.toLowerCase()
                }))}
            />
        </div>
    );
}
