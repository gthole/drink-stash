import React, { useState } from 'react';
import './style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import { Button } from 'components/Forms';
import { Loading } from 'components/Loading';
import { SearchBar } from 'components/SearchBar';
import { Placeholder } from 'components/Structure';
import { RecipeCard } from 'pages/Recipes/RecipeCard';
import { RecipeFilters } from 'pages/Recipes/RecipeFilters';
import { SearchPills } from 'pages/Recipes/SearchPills';
import { SearchPagination } from 'pages/Recipes/SearchPagination';

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
    }

    return (
        <div className="RecipeSearch">
            <Button type="clear" onClick={ () => setShowFilters(!showFilters) }>
                <FontAwesomeIcon icon={ showFilters ? faMinus : faPlus }/>
            </Button>
            <SearchBar
                total={ total }
                value={ params.q }
                setValue={ addSearchTerm }
            />
            <RecipeFilters
                expanded={ showFilters }
                setExpanded={ setShowFilters }
                addFilter={ (val) => addSearchTerm(val) }
            />
            <SearchPills
                terms={ params.search }
                remove={ removeSearchTerm }
            />
            <div className={ loading ? 'loading' : ''}>
                { rows }
                <Placeholder
                    condition={ recipes && recipes.length === 0 }
                    children={ 'No recipes found.' }
                />
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
