import React, { useState, useEffect, useContext } from 'react';
import { Redirect, useParams, useHistory } from 'react-router-dom';
import { Input, TextArea, Button, ButtonRow } from 'components/Forms';
import { Card } from 'components/Structure';
import { AppContext } from 'context/AppContext';
import { List } from 'services/lists';
import { services } from 'services';

export function ListEdit() {
    const { currentUser } = useContext(AppContext);
    const { id } = useParams();
    const history = useHistory();
    const [list, setList] = useState(null);

    useEffect(() => {
        if (!id) {
            const l = new List({
                name: '',
                description: '',
                user: currentUser
            })
            return setList(l);
        }
        services.lists.getById(id).then((l) => setList(l));
    }, [id, currentUser]);

    function remove() {
        services.lists.remove(list).then(() => {
            history.push(`/users/${currentUser.username}/lists`, {});
        });
    }

    function save() {
        const l = new List(list);
        let promise;
        if (list.id) {
            promise = services.lists.update(l);
        } else {
            promise = services.lists.create(l);
        }
        promise.then((saved) => {
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
                        setList(Object.assign({}, list));
                    }}
                />
                <TextArea
                    label="Description"
                    value={ list.description }
                    expanded={ true }
                    onChange={ (ev) => {
                        list.description = ev.target.value;
                        setList(Object.assign({}, list));
                    }}
                />
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
