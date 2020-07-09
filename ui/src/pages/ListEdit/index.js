import React, { useState, useContext } from 'react';
import { Redirect, useParams, useHistory } from 'react-router-dom';
import { Input, TextArea, Button, ButtonRow } from 'components/Forms';
import { Card } from 'components/Structure';
import { AppContext } from 'context/AppContext';
import { useAlertedEffect } from 'hooks/useAlertedEffect';
import { List, ListRecipe } from 'services/lists';
import { services } from 'services';

export function ListEdit({location}) {
    const { currentUser } = useContext(AppContext);
    const { id } = useParams();
    const history = useHistory();
    const [list, setList] = useState(null);
    const initial = location.state ? location.state.initial : null;

    useAlertedEffect(async () => {
        if (!id) {
            const l = new List({
                name: '',
                description: '',
                user: currentUser
            })
            return setList(l);
        }
        const l = await services.lists.getById(id);
        setList(l);
    }, [id, currentUser]);

    function remove() {
        services.lists.remove(list).then(() => {
            history.push(`/users/${currentUser.username}/lists`, {});
        });
    }

    function save() {
        let promise;
        if (list.id) {
            promise = services.lists.update(list);
        } else {
            promise = services.lists.create(list);
        }
        promise.then(async (saved) => {
            if (initial) {
                const toCreate = new ListRecipe({
                    user_list: {id: saved.id},
                    recipe: initial
                });
                await services.listRecipes.create(toCreate)
            }
            history.push(`/users/${currentUser.username}/lists/${saved.id}`, {});
        });
    }

    if (!list) return '';
    if (list.user.username !== currentUser.username) {
        return <Redirect to="/" />
    }

    return (
        <div className="ListEdit page-container">
            <Card>
                <Input
                    label="Name"
                    value={ list.name }
                    onChange={ (ev) => {
                        list.name = ev.target.value;
                        setList(new List(list));
                    }}
                />
                <TextArea
                    label="Description"
                    value={ list.description }
                    expanded={ true }
                    onChange={ (ev) => {
                        list.description = ev.target.value;
                        setList(new List(list));
                    }}
                />
                {
                    initial ?
                    <div style={{ marginBottom: '20px', color: '#72757a' }}>
                        With initial recipe: { initial.name }
                    </div> :
                    ''
                }
                <ButtonRow>
                    <Button type="danger" onClick={ () => remove() }>
                        Delete
                    </Button>
                    <Button type="primary" onClick={ () => save() }>
                        Save
                    </Button>
                </ButtonRow>
            </Card>
        </div>
    );
}
