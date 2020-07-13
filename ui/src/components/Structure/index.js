import React from 'react';
import './style.css';

function divFactory(cn) {
    return function({className, ...rest}) {
        if (!rest.children) return '';
        return (
            <div
                className={cn + (className ? ' ' + className : '')}
                {...rest}
            />
        )
    };
}

export const Card = divFactory('Card');
export const PageTitle = divFactory('PageTitle');
export const SectionTitle = divFactory('SectionTitle');
export const Description = divFactory('Description');
export const ResponsivePanes = divFactory('ResponsivePanes');

export function Placeholder({className, condition, ...rest}) {
    if (!condition) return '';
    return <div
        className={'Placeholder' + (className ? ' ' + className : '')}
        {...rest}
    />;
}

export function SidePanelList({ left, right, className }) {
    return (
        <div className={ 'SidePanelList' + (className ? ' ' + className : '') }>
            <div className="left">{left}</div>
            <div className="right">{right}</div>
        </div>
    );
}
