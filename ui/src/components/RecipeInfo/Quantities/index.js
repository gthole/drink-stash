import React from 'react';
import './style.css';
import * as n2f from 'num2fraction';
import { fracCodes, pluralize } from './constants';

function Amount({amount, unit, multiplier}) {
    // We start displaying cups after 1/2 cup (4oz), and 1 cup = 8oz
    let value = amount * multiplier;
    if (unit === 'oz' && value > 4) {
        value /= 8;
    }

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

function Unit({amount, unit, multiplier}) {
    let res = unit;
    const value = amount * multiplier
    if (unit === 'oz' && value > 4) {
        res = 'cup';
    }
    // Pluralize
    if (value > 1) {
        res = pluralize(res);
    }
    return res;
}

export function Quantities({quantities, multiplier}) {
    const qs = quantities.map((q, i) => (
        <div className="QuantityRow" key={'quantity-' + i}>
            <div className="amount">
                <Amount amount={ q.amount } multiplier={ multiplier } unit={ q.unit } />
                <Unit amount={ q.amount } multiplier={ multiplier } unit={ q.unit } />
            </div>
            <div className="ingredient">{ q.ingredient }</div>
        </div>
    ));

    return <div className="Quantities">{qs}</div>;
}
