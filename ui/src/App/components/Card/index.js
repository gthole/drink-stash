import React from 'react';
import './style.css';

export function Card({className, children}) {
    return (
        <div className={ 'Card' + (className ? ' ' + className : '') }>
            {children}
        </div>
    );
}
