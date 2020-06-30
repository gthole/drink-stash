import React, { useState } from 'react';
import './style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons'
import { Button } from '../../../components/Forms';
import { Loading } from '../../../components/Loading';
import { SearchBar } from '../../../components/SearchBar';
import { RecipeCard } from '../RecipeCard';
import { RecipeFilters } from '../RecipeFilters';
import { SearchPills } from '../SearchPills';
import { SearchPagination } from '../SearchPagination';

export function RecipeSearch({ recipes, total, loading, params, setParams, selectRecipe }) {
    const [showFilters, setShowFilters] = useState(false);

    function addSearchTerm(value) {
        if (!params.search.includes(value)) {
            params.search.push(value);
            params.page = 1;
        }
        setParams(params);
        // setShowFilters(false);
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

    let rows = <Loading />
    if (recipes) {
        rows = recipes.map((r, i) => (
            <RecipeCard key={'recipe-' + i} recipe={r} onClick={() => selectRecipe(r.slug)}/>
        ));
    } else if (recipes && recipes.length === 0) {
        rows = <div>No recipes found</div>
    }

    return (
        <div className="RecipeSearch">
            <Button type="clear" onClick={ () => setShowFilters(!showFilters) }>
                <FontAwesomeIcon icon={ showFilters ? faCaretDown : faCaretUp }/>
            </Button>
            <SearchBar
                total={ total }
                value={ params.q }
                setValue={ addSearchTerm }
            />
            <SearchPills
                terms={ params.search }
                remove={ removeSearchTerm }
            />
            <RecipeFilters
                expanded={ showFilters }
                setExpanded={ setShowFilters }
                addFilter={ (val) => addSearchTerm(val) }
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
