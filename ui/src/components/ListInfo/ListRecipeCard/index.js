import React, { useState } from 'react';
import './style.css';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { Button, ButtonRow, TextArea } from 'components/Forms';
import { Description } from 'components/Structure';
import { IngredientRow } from 'components/IngredientRow';
import { services } from 'services';

export function ListRecipeNotes({listRecipe, canEdit, update}) {
    const [editing, setEditing] = useState(false);
    const [notes, setNotes] = useState(listRecipe.notes || '');

    if (!editing) {
        return (
             <div className="list-recipe-note">
                {
                    listRecipe.notes ?
                    <Description children={ listRecipe.notes }/> :
                    ''
                }
                <div children={
                    canEdit ?
                    <Button type="clear" onClick={ () => setEditing(true) }>
                        ({listRecipe.notes ? 'edit' : 'add notes'})
                    </Button> :
                    ''
                }/>
            </div>
        );
    }

    function save() {
        listRecipe.notes = notes;
        update(listRecipe);
        setEditing(false);
        services.listRecipes.update(listRecipe);
    }

    return (
        <div className="list-recipe-edit-note">
            <TextArea
                value={ notes }
                expanded={ true }
                onChange={ (ev) => setNotes(ev.target.value) }
            />
            <ButtonRow>
                <Button type="clear small" onClick={ () => setEditing(false) }>
                    Cancel
                </Button>
                <Button type="primary small" onClick={ () => save() }>
                    Save
                </Button>
            </ButtonRow>
        </div>
    );
}

export function ListRecipeCard({listRecipe, canEdit, update, remove}) {
    if (!listRecipe) return '';

    function removeLr() {
        services.listRecipes.removeById(listRecipe.id);
        remove(listRecipe);
    }

    return (
        <div className="ListRecipeCard">
            <div className="lr-card-title-row">
                <Link className="recipe-name" to={ `/recipes/${listRecipe.recipe.slug}` }>
                    { listRecipe.recipe.name }
                </Link>
                {
                    canEdit ?
                    <FontAwesomeIcon icon={ faTimes } onClick={ removeLr }/> :
                    ''
                }
            </div>
            <IngredientRow ingredients={ listRecipe.recipe.ingredients }/>
            <ListRecipeNotes
                listRecipe={ listRecipe }
                canEdit={ canEdit }
                update={ update }
            />
        </div>
    );
}
