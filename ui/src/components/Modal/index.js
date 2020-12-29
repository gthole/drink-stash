import React from 'react';
import './style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Button } from 'components/Forms';
import { SectionTitle } from 'components/Structure';

export function Modal({show, size, title, body, footer, close}) {
    return (
        <div
            className={'Modal' + (show ? '' : ' modal-closed')}
            onClick={ () => close() }
        >
            <div
                className={'modal-content ' + (size || 'lg')}
                onClick={ (ev) => ev.stopPropagation() }
            >
                <div className="modal-header">
                    <SectionTitle>{ title }</SectionTitle>
                    <Button type="clear" onClick={ () => close() }>
                         <FontAwesomeIcon icon={ faTimes } />
                    </Button>
                </div>
                <div className="modal-body">
                    { body }
                </div>
                <div className="modal-footer">
                    { footer }
                </div>
            </div>
        </div>
    );
}


