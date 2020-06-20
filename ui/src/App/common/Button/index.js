import React from 'react';
import './style.css';

export function Button({type, href, onClick, children}) {
    return <button className={'Button ' + type} onClick={onClick}>{children}</button>
}
