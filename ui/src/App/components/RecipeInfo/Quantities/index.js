import React from 'react';
import './style.css';
import * as n2f from 'num2fraction';

const fracCodes = {
    '1/2': '&#189;',
    '1/3': '&#8531;',
    '2/3': '&#8532;',
    '1/4': '&#188;',
    '3/4': '&#190;',
    '1/5': '&#8533;',
    '2/5': '&#8534;',
    '3/5': '&#8535;',
    '4/5': '&#8536;',
    '1/6': '&#8537;',
    '5/6': '&#8538;',
};

function Amount({value}) {
    const whole = Math.floor(value);
    const part = value - whole;

    let remainder;
    if (part > 0.01) {
        const frac = n2f(part);
        if (fracCodes[frac]) {
            remainder = <span
                dangerouslySetInnerHTML={{ __html: fracCodes[frac] }}
                style={{ fontSize: '1.5em' }}
            />;
        } else {
            const [num, denom] = n2f(part).split('/');
            remainder = (
                <span>
                    <sup>{num}</sup>/<sub>{denom}</sub>
                </span>
            );
        }
    }
    return (
        <span className="Amount">
            <span>{ whole ? whole : '' }</span>
            { remainder }
        </span>
    );
}

export function Quantities({quantities}) {
    const qs = quantities.map((q, i) => (
        <div className="QuantityRow" key={'quantity-' + i}>
            <div className="amount">
                <Amount value={ q.amount } />
                { q.unit }
            </div>
            <div className="ingredient">{ q.ingredient }</div>
        </div>
    ));

    return <div className="Quantities">{qs}</div>;
}
