import React, { useState, useEffect } from 'react';
import { parseSearch, stringifySearch } from './search';
import { useHistory } from 'react-router-dom';
import { RecipeInfo } from 'components/RecipeInfo';
import { SidePanelList } from 'components/Structure';
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

    useEffect(() => {
        setLoading(true);
        history.replace(`/recipes/?${stringifySearch(params, slug)}`);
        const qp = Object.assign({per_page: 50}, params);
        qp.search = qp.search.map(s => s.split('[')[0]);
        services.recipes.getPage(qp).then((resp) => {
            setResp(resp);
            setLoading(false);
            setTimeout(() => window.scrollTo({top: 0, behavior: 'smooth'}), 0);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params, history]);

    useEffect(() => {
        if (!slug) return;
        const mobile = window.innerWidth < 1024;
        if (mobile) {
            return history.push(`/recipes/${slug}`, {})
        }
        history.replace(`/recipes/?${stringifySearch(params, slug)}`);
        services.recipes.getById(slug).then(setRecipe);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug, history]);

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
                    refresh={ () => setParams(Object.assign({}, params)) }
                />
            }
        />
    );
}
