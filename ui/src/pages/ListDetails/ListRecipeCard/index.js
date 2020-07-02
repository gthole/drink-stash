import React, { useState } from 'react';
import './style.css';
import { Link } from 'react-router-dom';
import { Button, TextArea } from 'components/Forms';
import { IngredientRow } from 'components/IngredientRow';

export function ListRecipeCard({listRecipe}) {
    const [editing, setEditing] = useState(false);
    const [note, setNote] = useState(listRecipe ? listRecipe.note : '');
    if (!listRecipe) return '';

    return (
        <div className="ListRecipeCard">
            <Link className="recipe-name" to={ `/recipes/${listRecipe.recipe.slug}` }>
                { listRecipe.recipe.name }
            </Link>
            <IngredientRow ingredients={ listRecipe.recipe.ingredients }/>
            {
                editing ?
                    <div className="list-recipe-edit-note">
                        <TextArea value={ note } onChange={ (ev) => setNote(ev.target.value) }/>
                        <Button type="primary small" onClick={ () => console.log() }>
                            Save
                        </Button>
                    </div> :
                    <div className="list-recipe-note">
                        { listRecipe.notes }
                        <Button type="clear" onClick={ () => setEditing(true) }>
                            ({listRecipe.notes ? 'edit' : 'add notes'})
                        </Button>
                    </div>
            }
        </div>
    );
}
