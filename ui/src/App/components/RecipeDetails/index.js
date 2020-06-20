import React, { useState } from 'react';
import './style.css';
import { useParams } from 'react-router-dom';
import { RecipeService } from '../../../services/recipes';
import { RecipeInfo } from '../../common/RecipeInfo';

const recipeService = new RecipeService();

export function RecipeDetails() {
    const { slug } = useParams();
    const [recipe, setRecipe] = useState(null);

    async function getRecipe() {
        const recipe = await recipeService.getById(slug);
        setRecipe(recipe);
    }

    if (!recipe) {
        getRecipe();
        return '';
    }

    return (
        <div className="RecipeDetails">
            <RecipeInfo recipe={recipe} />
        </div>
    );
}

