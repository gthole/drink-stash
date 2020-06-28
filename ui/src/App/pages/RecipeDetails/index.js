import React, { useState, useEffect } from 'react';
import './style.css';
import { useParams } from 'react-router-dom';
import { services } from '../../../services';
import { RecipeInfo } from '../../components/RecipeInfo';


export function RecipeDetails() {
    const { slug } = useParams();
    const [recipe, setRecipe] = useState(null);

    useEffect(() => {
        services.recipes.getById(slug).then((r) => setRecipe(r));
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

