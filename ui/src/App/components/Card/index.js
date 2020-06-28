import React from 'react';
import './style.css';

export function Card({className, children, ...rest}) {
    return (
        <div className={ 'Card' + (className ? ' ' + className : '') } {...rest}>
            {children}
        </div>
    );
}
