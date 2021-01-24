import React, { useState } from 'react';
import { stringify } from 'querystring';
import { parseSearch, stringifySearch, cleanParams } from './search';
import { useHistory } from 'react-router-dom';
import { RecipeInfo } from 'components/RecipeInfo';
import { SidePanelList } from 'components/Structure';
import { useAlertedEffect } from 'hooks/useAlertedEffect';
import { RecipeSearch } from 'pages/Recipes/RecipeSearch';
import { services } from 'services';


export function Recipes() {
    const history = useHistory();

    // Query parameters
    const [initialSlug, initialParams] = parseSearch(window.location.search);
    const [slug, setSlug] = useState(initialSlug);
    const [params, setParams] = useState(initialParams);

    // Internal State
    const [loading, setLoading] = useState(false);
    const [resp, setResp] = useState(null);
    const [recipe, setRecipe] = useState(null);

    useAlertedEffect(async () => {
        setLoading(true);
        history.replace(`/recipes/?${stringifySearch(params, slug)}`);

        const qp = cleanParams(params);
        const newResp = await services.recipes.getPage(qp);

        setResp(newResp);
        setLoading(false);
    }, [params, history]);

    useAlertedEffect(async () => {
        if (!slug) return;
        const mobile = window.innerWidth < 1024;
        if (mobile) {
            return history.push(`/recipes/${slug}`, {})
        }
        history.replace(`/recipes/?${stringifySearch(params, slug)}`);
        const r = await services.recipes.getById(slug);
        setRecipe(r);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug, history]);

    function updateRecipeList(updates) {
        // Clear cache. NB: This might need to be more thorough
        const qp = cleanParams(params);
        sessionStorage.removeItem(`/api/v1/recipes/?${stringify(qp)}`);

        const r = resp.results.find((r) => r.id === recipe.id);
        if (!r) return;
        Object.keys(updates).forEach(attr => r[attr] = updates[attr]);
        setResp({...resp});
    }

    return (
        <SidePanelList
            className="RecipeList"
            left={
                <RecipeSearch
                    recipes={resp ? resp.results : null}
                    total={resp ? resp.count : null}
                    loading={loading}
                    params={params}
                    setParams={(p) => setParams(Object.assign({}, p))}
                    selectRecipe={setSlug}
                />
            }
            right={
                <RecipeInfo
                    recipe={ recipe }
                    addComment={ () => {
                        updateRecipeList({
                            comment_count: recipe.comment_count + 1,
                            uc_count: 1
                        });
                    }}
                    setUserList={ (ul_count) => {
                        updateRecipeList({ul_count});
                    }}
                />
            }
        />
    );
}
