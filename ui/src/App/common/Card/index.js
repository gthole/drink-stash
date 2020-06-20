import React from 'react';
import './style.css';

export function Card({children}) {
    return (
        <div className="Card">
            {children}
        </div>
    );
}
