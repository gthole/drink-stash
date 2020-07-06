import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAlertedEffect } from 'hooks/useAlertedEffect';
import { services } from 'services';
import { RecipeInfo } from 'components/RecipeInfo';


export function RecipeDetails() {
    const { slug } = useParams();
    const [recipe, setRecipe] = useState(null);

    useAlertedEffect(async () => {
        const r = await services.recipes.getById(slug);
        setRecipe(r);
    }, [slug]);

    if (!recipe) {
        return '';
    }

    return (
        <div className="RecipeDetails page-container">
            <RecipeInfo recipe={recipe} />
        </div>
    );
}

