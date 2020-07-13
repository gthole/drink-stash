import React, { useState } from 'react';
import './style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { useAlertedEffect } from 'hooks/useAlertedEffect';
import { Button } from 'components/Forms';
import { TagList, TagListEdit } from 'components/TagList';
import { services } from 'services';

export function ManageTags({recipe, canEdit, refresh}) {
    const [editing, setEditing] = useState(false);
    const [tags, setTags] = useState(recipe.tags);
    const [sourceTags, setSourceTags] = useState(null);

    useAlertedEffect(async () => {
        const tagResp = await services.tags.getPage();
        setSourceTags(tagResp.results);
    }, []);

    if (!canEdit || !sourceTags) {
        return (
            <div className="ManageTags">
                <TagList tags={ recipe.tags } />
            </div>
        );
    }

    async function save() {
        recipe.tags = tags;
        await services.recipes.update(recipe);
        setEditing(false);
    }

    if (editing) {
        return (
            <div className="ManageTags editing">
                <TagListEdit tags={ tags } setTags={ setTags } sourceTags={ sourceTags }/>
                <Button type="primary small" onClick={ () => save() }>
                    Save
                </Button>
                <Button type="clear small" onClick={ () => {
                    setEditing(false)
                    setTags(recipe.tags);
                }}>
                    <FontAwesomeIcon icon={ faTimes }/>
                </Button>
            </div>
        );
    }

    return (
        <div className="ManageTags show-button">
            <TagList tags={ recipe.tags }/>
            <Button type="clear small" onClick={ () => setEditing(true) }>
                (edit tags)
            </Button>
        </div>
    );
}
