import React, { useState, useContext } from 'react';
import './style.css';
import { Select, Button } from 'components/Forms';
import { Card, Placeholder } from 'components/Structure';
import { RecipeInfo } from 'components/RecipeInfo';
import { AppContext } from 'context/AppContext';
import { useAlertedEffect } from 'hooks/useAlertedEffect';
import { services } from 'services';

export function RecipeRandom() {
    const { currentUser } = useContext(AppContext);
    const [state, setState] = useState({});

    async function shuffle() {
        if (!state.count) {
            setState({...state, recipe: null});
            return;
        }

        const index = Math.floor(Math.random() * state.count) + 1;
        const params = {
            search: [`LIKE list = ${state.list.id}`, `NOT commenter = ${currentUser.user_id}`],
            per_page: 1,
            page: index
        };

        const resp = await services.recipes.getPage(params);
        const rid = resp.results[0].id;
        if (state.count > 1 && state.recipe && state.recipe.id === rid) {
            return shuffle();
        }

        const recipe = await services.recipes.getById(rid);
        setState({...state, recipe});
    }

    useAlertedEffect(shuffle, [state.count]);

    useAlertedEffect(async () => {
        if (!state.list) return;
        const params = {
            search: [`LIKE list = ${state.list.id}`, `NOT commenter = ${currentUser.user_id}`],
            per_page: 0
        };
        const resp = await services.recipes.getPage(params);
        setState({...state, count: resp.count});
    }, [state.list]);

    useAlertedEffect(async () => {
        const listResp = await services.lists.getPage({user: currentUser.user_id});
        let list = listResp.results.find(l => l.name.toLowerCase() === 'favorites');
        list = list || listResp.results[0];

        setState({list, lists: listResp.results});
    }, []);

    if (!state.lists) return '';
    if (state.lists.length === 0) {
        return (
            <Card>
                <Placeholder
                    condition={ true }
                    children="Looks like you don't have any lists yet!"
                />
            </Card>
        );
    }

    return (
        <div className="RecipeRandom page-container">
            <Card className="list-select">
                <Select
                    subtext="Choose a list, and find recipes similar to the ones in it."
                    choices={ state.lists }
                    display="name"
                    select="id"
                    value={ state.list.id }
                    onChange={ (ev) => {
                        const list = state.lists.find(l => ev.target.value === '' + l.id);
                        setState({...state, list})
                    }}
                />
                <Button type="outline" onClick={ () => shuffle() }>Shuffle</Button>
            </Card>
            <RecipeInfo recipe={state.recipe} />
            {
                state.count === 0 ?
                <Card>
                    <Placeholder
                        condition={ true }
                        children="No recipes are similar to the ones in this list. Try adding more recipes."
                    />
                </Card> :
                ''
            }
        </div>
    );
}
