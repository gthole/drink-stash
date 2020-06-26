import React, { useState, useEffect } from 'react';
import './style.css';
import { useParams } from 'react-router-dom';
import { RecipeService } from '../../../services/recipes';
import { RecipeInfo } from '../../components/RecipeInfo';

const recipeService = new RecipeService();

export function RecipeDetails() {
    const { slug } = useParams();
    const [recipe, setRecipe] = useState(null);

    useEffect(() => {
        recipeService.getById(slug).then((r) => setRecipe(r));
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

