import React from 'react';
import './style.css';
import { fracCodes } from '../../constants';
import * as n2f from 'num2fraction';

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
