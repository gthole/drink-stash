import React, { useState } from 'react';
import './style.css';
import { useHistory } from 'react-router-dom';
import { RecipeService } from '../../../services/recipes';
import { RecipeSearch } from './RecipeSearch';
import { RecipeInfo } from '../../common/RecipeInfo';

const recipeService = new RecipeService();

export function RecipeList() {
    const [resp, setResp] = useState(null);
    const [recipe, setRecipe] = useState(null);
    const [params, setParams] = useState({search: [], page: 1});
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    async function updateSearch(newParams) {
        setParams(Object.assign({}, newParams));
        setLoading(true);
        const qp = Object.assign({per_page: 10}, newParams);
        const resp = await recipeService.getPage(qp);
        setResp(resp);
        setLoading(false);
        setTimeout(() => window.scrollTo({top: 0, behavior: 'smooth'}), 0);
    }

    async function selectRecipe(slug) {
        const mobile = window.innerWidth < 1024;
        if (mobile) {
            return history.push(`/recipes/${slug}`);
        }
        const r = await recipeService.getById(slug);
        setRecipe(r);
    }

    if (resp === null && !loading) {
        updateSearch(params);
    }

    return (
        <div className="RecipeList">
            <div className="search-wrapper">
                <RecipeSearch
                    recipes={resp ? resp.results : []}
                    total={resp ? resp.count : 0}
                    loading={loading}
                    params={params}
                    setParams={updateSearch}
                    selectRecipe={selectRecipe}
                />
            </div>
            <div className="info-wrapper">
                <RecipeInfo recipe={recipe} />
            </div>
        </div>
    );
}
