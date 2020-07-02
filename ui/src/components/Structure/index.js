import React from 'react';

export function PageTitle({className, ...rest}) {
    return (
        <div
            className={'PageTitle' + (className ? ' ' + className : '')}
            style={{
                fontSize: '1.5em',
            }}
            {...rest}
        />
    )
}

export function SectionTitle({className, ...rest}) {
    return (
        <div
            className={'SectionTitle' + (className ? ' ' + className : '')}
            style={{
                marginBottom: '10px',
                textTransform: 'uppercase',
                fontSize: '0.875rem',
                color: '#72757a'
            }}
            {...rest}
        />
    );
}

export function Description({className, ...rest}) {
    return (
        <div
            className={'Description' + (className ? ' ' + className : '')}
            style={{
                padding: '20px',
                backgroundColor: '#d1d1e9',
                color: '#2b2c34',
                lineHeight: '1.5em',
            }}
            {...rest}
        />
    );
}
