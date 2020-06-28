import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import OutsideClickHandler from 'react-outside-click-handler';
import './style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import { Button } from '../../../components/Forms';

export function RecipeMenu({recipe, canEdit, multiplier, setMultiplier}) {
    const [open, setOpen] = useState(false);
    const history = useHistory();

    let menu = '';
    if (open) {
        const multiplierOptions = [2, 4, 6, 8, 12].map((opt) => (
            <div
                    onClick={ () => {
                        setMultiplier( multiplier === opt ? 1 : opt);
                        setOpen(false);
                    }}
                    className={ multiplier === opt ? 'selected-multiplier' : '' }
                    key={ 'mult-' + opt }
                >
                Large Format - { opt }
            </div>
        ));
        menu = (
            <OutsideClickHandler onOutsideClick={() => setOpen(false)}>
                <div className="recipe-menu">
                    { multiplierOptions }
                    { canEdit ?
                      <div className="bordered" onClick={ () => history.push(`/recipes/${recipe.slug}/edit/` ) }>
                          Edit this Recipe
                      </div> : ''
                    }
                </div>
            </OutsideClickHandler>
        );
    }

    return (
        <div className="RecipeMenu">
            <Button className="recipe-menu-button" type="clear" onClick={ () => setOpen(!open) }>
                <FontAwesomeIcon icon={ faEllipsisV }/>
            </Button>
            { menu }
        </div>
    );
}
