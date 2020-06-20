import React from 'react';
import './style.css';
import { Card } from '../Card';
import { Quantities } from './Quantities';

export function RecipeInfo({recipe}) {
    if (!recipe) return '';


    return (
        <div className="RecipeInfo">
            <Card>
                <div className="title">
                    { recipe.name }
                </div>
                <Quantities quantities={recipe.quantities} />
                <div className="directions">
                    { recipe.directions }
                </div>
                <div className="description">
                    { recipe.description }
                </div>

            </Card>
        </div>
    );
}
