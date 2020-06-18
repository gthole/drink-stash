import React, { useState } from 'react';
import { RecipeService } from '../../../services/recipes';
import { RecipeSearch } from './RecipeSearch';

const recipeService = new RecipeService();

export function RecipeList() {
    const [resp, setResp] = useState(null);

    if (resp === null) {
        recipeService.getPage({per_page: 10}).then((resp) => setResp(resp));
    }

    return (
        <div className="RecipeList">
            <RecipeSearch
                recipes={resp ? resp.results : []}
                initialParams={{}}
                total={resp ? resp.total : 0}
            />
        </div>
    );
}
