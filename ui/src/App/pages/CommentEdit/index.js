import React, { useState, useEffect } from 'react';
import './style.css';
import { Redirect, useParams, useHistory } from 'react-router-dom';
import { Card } from '../../components/Card';
import { TextArea, Button } from '../../components/Forms';
import { AuthService } from '../../../services/auth';
import { CommentService } from '../../../services/comments';

const authService = new AuthService();
const commentService = new CommentService();

export function CommentEdit() {
    const { id } = useParams();
    const history = useHistory();
    const [comment, setComment] = useState(null);

    useEffect(() => {
        commentService.getById(id).then((c) => setComment(c));
    }, [id]);

    function remove() {
        commentService.remove(comment).then(() => {
            history.push('/', {});
        });
    }

    function save() {
        commentService.update(comment).then(() => {
            history.push(`/recipes/${ comment.recipe.slug }`, {});
        });
    }

    if (!comment) return '';

    if (comment.user.id !== authService.getUserData().user_id) {
        return <Redirect to="/" />
    }

    return (
        <div className="CommentEdit page-container">
            <Card>
                <TextArea
                    value={ comment.text }
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
