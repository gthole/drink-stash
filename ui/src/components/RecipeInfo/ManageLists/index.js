import React, { useState, useContext } from 'react';
import './style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Button, CheckBox } from 'components/Forms';
import { SectionTitle } from 'components/Structure';
import { AppContext } from 'context/AppContext';
import { services } from 'services';
import { ListRecipe } from 'services/lists';

function ManageListsRow({list, toggleList}) {
    return (
        <div className="ManageListsRow" onClick={ () => toggleList(list) }>
            <div className={ 'list-select' + (list.added_to_recipe ? ' selected' : '') } >
                <CheckBox value={ list.added_to_recipe }/>
            </div>
            <div>{ list.name }</div>
        </div>
    );
}

function ManageListsModal({ show, recipe, lists, currentUser, close, toggleList }) {
    if (!show) return '';
    const rows = lists.map((l, i) => (
        <ManageListsRow key={ `list-row-${i}` } list={ l } toggleList={ toggleList }/>
    ));
    return (
        <div className="ManageListsModal" onClick={ () => close() }>
            <div className="modal-content" onClick={ (ev) => ev.stopPropagation() }>
                <div className="modal-header">
                    <SectionTitle>Add to Lists</SectionTitle>
                    <Button type="clear" onClick={ () => close() }>
                         <FontAwesomeIcon icon={ faTimes } />
                    </Button>
                </div>
                <div className="modal-body">
                    { rows }
                </div>
                <div className="modal-footer">
                    <Link to={{
                            pathname: `/users/${ currentUser.username }/lists/new`,
                            state: {initial: recipe}
                        }}>
                        <FontAwesomeIcon icon={ faPlus } />
                        Create a new list with this recipe
                    </Link>
                </div>
            </div>
        </div>
    );
}

export function ManageLists({ recipe, listRecipes, lists, setContent }) {
    const [showModal, setShowModal] = useState(false);
    const { currentUser } = useContext(AppContext);

    if (!listRecipes) return '';
    const userLrs = listRecipes.filter(lr => lr.user.id === currentUser.user_id);
    lists.forEach((l) => {
        l.added_to_recipe = Boolean(userLrs.find(lr => lr.list.id === l.id));
    });

    const listLinks = userLrs.map((lr, i) => (
        <span className="list-link" key={ `list-link-${i}` }>
            <Link to={ `/users/${currentUser.username}/lists/${lr.list.id}` }>
                { lr.list.name }
            </Link>
        </span>
    ));

    async function toggleList(list) {
        const lr = listRecipes.find((lr) => lr.list.id === list.id);
        let lrs;
        if (lr) {
            await services.listRecipes.remove(lr);
            list.added_to_recipe = false;
            lrs = listRecipes.filter((lr) => lr.list.id !== list.id);
        } else {
            const toCreate = new ListRecipe({
                user_list: {id: list.id, name: list.name},
                recipe: recipe
            });
            const saved = await services.listRecipes.create(toCreate)
            list.added_to_recipe = true;
            lrs = [...listRecipes, saved];
        }
        setContent({listRecipes: lrs, lists: [...lists]});
    }

    return (
        <div className="ManageLists">
            <SectionTitle>Lists</SectionTitle>
            <div className="list-links">
                { listLinks }
                <span>
                    <Button type="outline small" onClick={ () => setShowModal(true) }>
                        <FontAwesomeIcon icon={ faPlus } /> Add to Lists
                    </Button>
                </span>
            </div>
            <ManageListsModal
                show={ showModal }
                recipe={ recipe }
                lists={ lists }
                currentUser={ currentUser }
                close={ () => setShowModal(false) }
                toggleList={ toggleList }
            />
        </div>
    );
}
