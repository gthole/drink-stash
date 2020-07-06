import React, { useState } from 'react';
import { parseSearch, stringifySearch } from './search';
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

        const qp = Object.assign({per_page: 50}, params);
        qp.search = qp.search.map(s => s.split('[')[0]);
        const resp = await services.recipes.getPage(qp);

        setResp(resp);
        setLoading(false);
        setTimeout(() => window.scrollTo({top: 0, behavior: 'smooth'}), 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
