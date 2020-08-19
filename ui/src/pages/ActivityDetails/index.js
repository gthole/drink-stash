import React, { useState } from 'react';
import './style.css';
import { useParams } from 'react-router-dom';
import { parse } from 'querystring';
import { CardRow } from 'components/Activity/ActivityRecipeCards';
import { ProfileImage } from 'components/ProfileImage';
import { Card, Placeholder, SectionTitle } from 'components/Structure';
import { useAlertedEffect } from 'hooks/useAlertedEffect';
import { services } from 'services';

export function ActivityDetails() {
    const [user, setUser] = useState();
    const [rows, setRows] = useState([]);
    const [params, setParams] = useState();
    const { activityType } = useParams();

    useAlertedEffect(async () => {
        if (!params) return;
        const user_id = params.user_list__user || params.added_by;
        const user = await services.users.getById(user_id);
        setUser(user);

        if (activityType === 'recipe') {
            const resp = await services.recipes.getPage(params);
            setRows(resp.results.map((r) => ({recipe: r, user: r.added_by})));
        }
        if (activityType === 'listrecipe') {
            const resp = await services.listRecipes.getPage(params);
            setRows(resp.results);
        }
    }, [activityType, params]);

    if (!params) {
        const p = parse(window.location.search.slice(1));
        setParams(p);
        return '';
    }

    if (!user) {
        return '';
    }

    return (
        <Card className="ActivityDetails page-container">
            <div className="user-section">
                <ProfileImage user={ user } size={ 80 } />
                <div>
                    <SectionTitle children="Activity Details"/>
                    { user.first_name } { user.last_name }
                    {
                        activityType === 'recipe' ?
                        ' added some recipes' :
                        ' added some recipes to lists'
                    }
                </div>
            </div>
            { rows.map((r, i) => <CardRow key={ i } {...r} />) }
            <Placeholder
                condition={ !['recipe', 'listrecipe'].includes(activityType) }
                children={ 'Unknown activity type. Sorry!' }
            />
        </Card>
    );
}
