import React, { useState } from 'react';
import { SearchBar } from '../../../common/SearchBar';

export function RecipeSearch({ recipes, total }) {
    const [params, setParams] = useState({q: ''});

    function setParam(name, value) {
        params[name] = value;
        setParams(Object.assign({}, params));
    }

    const rows = recipes.map((r, i) => <div key={'recipe-' + i}>{ r.name }</div>);

    return (
        <div className="RecipeSearch">
            <SearchBar
                total={total}
                value={params.q}
                setValue={(v) => setParam('q', v)}
            />
            { rows }
        </div>
    );
}
