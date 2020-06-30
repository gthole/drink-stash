import React, { useState, useEffect } from 'react';
import './style.css';
import { Redirect, useParams, useHistory } from 'react-router-dom';
import { Card } from '../../components/Card';
import { TextArea, Button } from '../../components/Forms';
import { services } from '../../../services';


export function CommentEdit() {
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

    if (comment.user.id !== services.auth.getUserData().user_id) {
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
                <div className="comment-buttons">
                    <Button type="danger" onClick={ () => remove() }>
                        Delete
                    </Button>
                    <Button type="primary" onClick={ () => save() }>
                        Save
                    </Button>
                </div>
            </Card>
        </div>
    );
}
