import React from 'react';
import './style.css';

/*
 * {
 *   "display": "what goes inside the pill in the ui",
 *   "className": "pill's display class",
 *   "term": "full search term"
 * }
 */

export function SearchPills({terms, remove}) {
    if (!terms || terms.length === 0) return '';

    const pills = terms.map((term, i) => {
        let cn = 'pill';
        if (term.startsWith('NOT ')) {
            cn += ' negation';
        } else if (term.includes(' = ')) {
            cn += ' constraint';
        }
        const m = term.match(/\[(.*)\]$/);
        const display = m ? m[1] : term;

        return (
            <div
                className={ cn }
                key={'pill-' + i}
                onClick={() => remove(term)}>
                {display} &times;
            </div>
        );
    });

    return (
        <div className="SearchPills">
            {pills}
        </div>
    );
}
