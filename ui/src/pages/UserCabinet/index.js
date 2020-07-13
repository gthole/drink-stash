import React, { useState, useContext } from 'react';
import './style.css';
import { Redirect, useParams, useHistory } from 'react-router-dom';
import { SidePanelList } from 'components/Structure';
import { AppContext } from 'context/AppContext';
import { useAlertedEffect } from 'hooks/useAlertedEffect';
import { CategoryList } from 'pages/UserCabinet/CategoryList';
import { IngredientCategory } from 'pages/UserCabinet/IngredientCategory';
import { services } from 'services';

export function UserCabinet() {
    const { username, selectedParam } = useParams();
    const history = useHistory();
    const { currentUser } = useContext(AppContext);
    const [content, setContent] = useState({});
    const [selected, setSelected] = useState(selectedParam);
    const [filter, setFilter] = useState('');

    useAlertedEffect(async () => {
        const [user, ingResp] = await Promise.all([
            services.users.getById(username),
            services.ingredients.getPage(),
        ]);

        const grouped = ingResp.results.reduce((g, i) => {
            i.user_has = user.ingredient_set.includes(i.name);
            if (!g[i.category]) g[i.category] = [];
            g[i.category].push(i);
            return g;
        }, {});
        setContent({user, grouped});
    }, [username]);

    if (!content.grouped) return '';
    if (username !== currentUser.username) {
        return <Redirect to="/"/>
    }

    let filtered = {...content.grouped};
    if (filter) {
        Object.keys(content.grouped).forEach((cat) => {
            filtered[cat] = content.grouped[cat].filter((i) => (
                i.name.toLowerCase().includes(filter.toLowerCase())
            ));
        });
    }

    const ingredientCategory = (
        <IngredientCategory
            user={ content.user }
            ingredients={ filtered[selectedParam || selected] }
            category={ selectedParam || selected }
            refresh={ () => {
                setContent({...content})
            }}
        />
    );

    if (selectedParam) {
        return ingredientCategory;
    }

    function select(cat) {
        const mobile = window.innerWidth < 1024;
        if (mobile) {
            return history.push(`/users/${username}/cabinet/${cat}`, {filter});
        }
        setSelected(cat);
    }

    return (
        <SidePanelList
            className="UserCabinet"
            left={
                <CategoryList
                    grouped={ filtered }
                    select={ select }
                    filter={ filter }
                    setFilter={ setFilter }
                />
            }
            right={ ingredientCategory }
        />
    );
}
