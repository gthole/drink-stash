import React from 'react';
import './style.css';
import { SearchBar } from '../../../common/SearchBar';
import { RecipeCard } from '../RecipeCard';
import { SearchPills } from '../SearchPills';
import { SearchPagination } from '../SearchPagination';

export function RecipeSearch({ recipes, total, loading, params, setParams, selectRecipe }) {

    function addSearchTerm(value) {
        if (!params.search.includes(value)) {
            params.search.push(value);
            params.page = 1;
        }
        setParams(params);
    }

    function removeSearchTerm(term) {
        params.search = params.search.filter(t => t !== term);
        params.page = 1;
        setParams(params);
    }

    function setPage(num) {
        params.page = num;
        setParams(params);
    }

    const rows = recipes.map((r, i) => (
        <RecipeCard key={'recipe-' + i} recipe={r} onClick={() => selectRecipe(r.slug)}/>
    ));

    return (
        <div className="RecipeSearch">
            <SearchBar
                total={ total }
                value={ params.q }
                setValue={ addSearchTerm }
            />
            <SearchPills
                terms={ params.search }
                remove={ removeSearchTerm }
            />
            <div className={ loading ? 'loading' : ''}>
                { rows }
            </div>
            <SearchPagination
                page={params.page}
                per_page={10}
                total={total}
                setPage={setPage}
            />
        </div>
    );
}
