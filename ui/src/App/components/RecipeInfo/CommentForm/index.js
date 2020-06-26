import React, { useState } from 'react';
import './style.css';
import { TextArea, Button } from '../../Forms';

export function CommentForm({show, submit}) {
    const [content, setContent] = useState('');
    const [expanded, setExpanded] = useState(false);
    if (!show) return '';

    function onClick() {
        submit(content);
        setContent('');
    }

    function closeMaybe(ev) {
        if (ev.target.nodeName !== 'TEXTAREA') {
            setExpanded(false);
        }
    }

    return (
        <div className="CommentForm" onClick={ closeMaybe }>
            <TextArea
                placeholder={'Have you made this? Tell us what you think!'}
                value={ content }
                expanded={ expanded }
                onFocus={ () => setExpanded(true) }
                onChange={(ev) => setContent(ev.target.value)}
            />
            <div className="comment-button">
                <Button
                    type="primary"
                    onClick={ onClick }>
                        Comment
                </Button>
            </div>
        </div>
    );
}
