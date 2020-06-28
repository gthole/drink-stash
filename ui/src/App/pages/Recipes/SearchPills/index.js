import React from 'react';
import './style.css';

export function SearchPills({terms, remove}) {
    if (!terms || terms.length === 0) return '';

    const pills = terms.map((term, i) => {
        let cn = 'pill';
        if (term.startsWith('NOT ')) cn += ' negation';
        return (
            <div
                className={ cn }
                key={'pill-' + i}
                onClick={() => remove(term)}>
                {term} &times;
            </div>
        );
    });

    return (
        <div className="SearchPills">
            {pills}
        </div>
    );
}