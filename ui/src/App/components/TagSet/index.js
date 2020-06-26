import React from 'react';

export function TagSet({tags, sourceTags, setTags}) {
    return (
        <div className="TagSet">
            { tags.map((t, i) => <span key={'tag-' + i}>{ t }</span>) }
        </div>
    );
}
