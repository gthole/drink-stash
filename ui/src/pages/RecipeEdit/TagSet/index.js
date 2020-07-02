import React, { useState } from 'react';
import './style.css';
import { AutoComplete } from 'components/AutoComplete';
import { TagList } from 'components/TagList';

export function TagSet({tags, setTags, initialEdit, sourceTags}) {
    const [value, setValue] = useState('');

    return (
        <div className="TagSet">
            <AutoComplete
                value={ value }
                setValue={ (val) => setValue(val) }
                onSelect={ (val) => {
                    setTags(tags.concat([val]));
                    setValue('');
                }}
                dataSource={ sourceTags }
            />
            <TagList tags={ tags } />
        </div>
    );
}
