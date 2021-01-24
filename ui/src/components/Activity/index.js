import React, { useState } from 'react';
import { stringify } from 'querystring';
import './style.css';
import { RecipeActivity } from 'components/Activity/RecipeActivity';
import { ListRecipeActivity } from 'components/Activity/ListRecipeActivity';
import { CommentActivity } from 'components/Activity/CommentActivity';
import { Button } from 'components/Forms';
import { Loading } from 'components/Loading';
import { SectionTitle, Placeholder } from 'components/Structure';
import { useAlertedEffect } from 'hooks/useAlertedEffect';
import { services } from 'services';

export function Activity({ params, showTitle, showPlaceholder }) {
    const [activities, setActivities] = useState();
    const [page, setPage] = useState(1);
    const map = {
        recipe: RecipeActivity,
        listrecipe: ListRecipeActivity,
        comment: CommentActivity,
    };

    // Use a string to toggle the load calls to prevent duplicate calls just
    // because the params object is new
    const qp = stringify(params);

    useAlertedEffect(async () => {
        const resp = await services.activities.getPage({page, ...params});
        setActivities(resp.results);
    }, [page, qp]);

    if (!activities) return <Loading />;

    const components = activities.map((activity, key) => {
        return React.createElement(map[activity.type], {key, activity, showTitle});
    });

    return (
        <div className="Activity">
            { showTitle ? <SectionTitle children="Activity"/> : '' }
            { components }
            {
                activities.length === 50 ?
                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                    <Button type="primary" onClick={ () => setPage(page + 1) }>
                        More
                    </Button>
                </div> :
                ''
            }
            <Placeholder
                children="No activity yet."
                condition={ showPlaceholder && activities.length === 0 }
            />
        </div>
    );
}
