import React, { useState, useContext } from 'react';
import './style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Button, CheckBox } from 'components/Forms';
import { Modal } from 'components/Modal';
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

export function ManageListsModal({ show, recipe, lists, currentUser, close, toggleList }) {

    const body = lists.map((l, i) => (
        <ManageListsRow key={ `list-row-${i}` } list={ l } toggleList={ toggleList }/>
    ));

    const footer = (
        <Link to={{
            pathname: `/users/${ currentUser.username }/lists/new`,
            state: {initial: recipe}
        }}>
            <FontAwesomeIcon icon={ faPlus } />
            Create a new list with this recipe
        </Link>
    );

    return (
        <Modal
            show={ show }
            size='sm'
            title='Add to Lists'
            close={ close }
            body={ body }
            footer={ footer }
        />
    );
}

export function ManageLists({ recipe, listRecipes, lists, setContent }) {
    const [showModal, setShowModal] = useState(false);
    const { currentUser } = useContext(AppContext);

    if (!listRecipes) {
        return (
            <div className="ManageLists">
                <SectionTitle children="Lists"/>
                <div className="list-links"/>
            </div>
        );
    }
    const userLrs = listRecipes.filter(lr => lr.user.id === currentUser.user_id);
    lists.forEach((l) => {
        const ulr = userLrs.find(lr => lr.list.id === l.id);
        l.added_to_recipe = Boolean(ulr);
        l.disabled = Boolean(ulr && !ulr.user.first_name);
    });

    const listLinks = userLrs.map((lr, i) => (
        <span className="list-link" key={ `list-link-${i}` }>
            <Link to={ `/users/${currentUser.username}/lists/${lr.list.id}` }>
                { lr.list.name }
            </Link>
        </span>
    ));

    async function toggleList(list) {
        if (list.disabled) return;
        const lr = listRecipes.find((lr) => lr.list.id === list.id);

        // We do setContent up front so that list adding is instantaneous for
        // the user, then fill in details after the API call completes
        if (lr) {
            const lrs = listRecipes.filter((lr) => lr.list.id !== list.id);
            setContent({listRecipes: lrs});
            await services.listRecipes.remove(lr);
        } else {
            const olr = [...listRecipes];
            const toCreate = new ListRecipe({
                user_list: {id: list.id, name: list.name},
                recipe: recipe,
                user: {id: currentUser.user_id},
            });
            setContent({listRecipes: [...olr, toCreate]});
            const saved = await services.listRecipes.create(toCreate)
            setContent({listRecipes: [...olr, saved]});
        }
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
