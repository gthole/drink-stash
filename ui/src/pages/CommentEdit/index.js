import React, { useState, useEffect, useContext } from 'react';
import { Redirect, useParams, useHistory } from 'react-router-dom';
import { TextArea, Button, ButtonRow } from 'components/Forms';
import { Card } from 'components/Structure';
import { AppContext } from 'context/AppContext';
import { services } from 'services';

export function CommentEdit() {
    const { currentUser } = useContext(AppContext);
    const { id } = useParams();
    const history = useHistory();
    const [comment, setComment] = useState(null);

    useEffect(() => {
        services.comments.getById(id).then((c) => setComment(c));
    }, [id]);

    function remove() {
        services.comments.remove(comment).then(() => {
            history.push(`/recipes/${ comment.recipe.slug }`, {});
        });
    }

    function save() {
        services.comments.update(comment).then(() => {
            history.push(`/recipes/${ comment.recipe.slug }`, {});
        });
    }

    if (!comment) return '';
    if (comment.user.id !== currentUser.user_id) {
        return <Redirect to="/" />
    }

    return (
        <div className="CommentEdit page-container">
            <Card>
                <TextArea
                    value={ comment.text }
                    expanded={ true }
                    onChange={ (ev) => {
                        comment.text = ev.target.value;
                        setComment(Object.assign({}, comment));
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
