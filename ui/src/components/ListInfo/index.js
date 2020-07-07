import React, { useState, useContext, useEffect } from 'react';
import './style.css';
import { Redirect } from 'react-router-dom';
import { Card, ResponsivePanes, Placeholder } from 'components/Structure';
import { AppContext } from 'context/AppContext';
import { ListInfoDetails } from 'components/ListInfo/ListInfoDetails';
import { ListRecipeCard } from 'components/ListInfo/ListRecipeCard';
import { services } from 'services';

export function ListInfo({ list, listUsername }) {
    const { currentUser } = useContext(AppContext);
    const [listRecipes, setListRecipes] = useState(null);


    useEffect(() => {
        if (!list) return;
        services.listRecipes
            .getPage({user_list: list.id})
            .then((lrResp) => setListRecipes(lrResp.results));
    }, [list])

    if (!list || !listRecipes) return '';
    if (listUsername !== list.user.username) {
        return <Redirect to={ `/users/${list.user.username}/lists/${list.id}` } />
    }

    const canEdit = list.user.id === currentUser.user_id;

    return (
        <ResponsivePanes className="ListInfo">
            <ListInfoDetails list={ list } canEdit={ canEdit }/>
            <Card>
                {
                    listRecipes.map((lr, i) => (
                        <ListRecipeCard
                            key={'list-recipe-card-' + i}
                            listRecipe={ lr }
                            canEdit={ canEdit }
                            update={ () => setListRecipes([...listRecipes]) }
                            remove={ (lr) => setListRecipes(listRecipes.filter(l => l.id !== lr.id)) }
                        />
                    ))
                }
                <Placeholder
                    condition={ listRecipes.length === 0 }
                    children="No recipes in this list yet."
                />
            </Card>
        </ResponsivePanes>
    );
}
