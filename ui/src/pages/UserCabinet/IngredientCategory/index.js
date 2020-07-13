import React from 'react';
import { CheckBox } from 'components/Forms';
import { Card, Placeholder } from 'components/Structure';
import { services } from 'services';
import { categories } from 'pages/UserCabinet/categories';

function IngredientCabinetRow({ingredient, user, refresh}) {
    function onClick() {
        if (user.ingredient_set.includes(ingredient.name)) {
            user.ingredient_set = user.ingredient_set.filter((i) => i !== ingredient.name);
            ingredient.user_has = false;
        } else {
            user.ingredient_set.push(ingredient.name);
            ingredient.user_has = true;
        }
        refresh();
        services.users.updateCabinet(user.ingredient_set);
    }

    return (
        <div className="IngredientCabinetRow" onClick={ onClick }>
            <div>
                <CheckBox value={ ingredient.user_has }/>
                {ingredient.name}
            </div>
            <div>{ingredient.usage}</div>
        </div>
    );
}

export function IngredientCategory({ user, category, ingredients, refresh }) {
    if (!ingredients || !category) return '';

    const rows = ingredients.map((i, j) => (
        <IngredientCabinetRow
            key={ 'ing-' + j }
            ingredient={ i }
            user={ user }
            refresh={ refresh }
        />
    ));
    return (
        <Card className="UserCabinetCategory">
            <div className="category-title">{ categories[category] }</div>
            <div className="IngredientCabinetRow category-header">
                <div>Ingredient</div>
                <div>Recipe Count</div>
            </div>
            { rows }
            <Placeholder children="No ingredients found." condition={ rows.length === 0}/>
        </Card>
    );
}
