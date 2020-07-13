import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import './style.css';
import { Activity } from 'components/Activity';
import { Loading } from 'components/Loading';
import { Button } from 'components/Forms';
import { SearchBar } from 'components/SearchBar';
import { Card } from 'components/Structure';
import { useAlertedEffect } from 'hooks/useAlertedEffect';
import { NavGroup } from 'pages/Home/NavGroup';
import { services } from 'services';

export function Home() {
    const [content, setContent] = useState(null);
    const [page, setPage] = useState(1);
    const history = useHistory();

    useAlertedEffect(async () => {
        const params = {
            page,
            created__gt: new Date(Date.now() - (page * 30 * 24 * 60 * 60 * 1000)).toISOString(),
            ordering: '-created'
        };
        const [cResp, lrResp, rResp] = await Promise.all([
            services.comments.getPage(params),
            services.listRecipes.getPage(params),
            services.recipes.getPage(params),
        ]);
        setContent({
            page: page,
            total: rResp.count,
            recipes: rResp.results,
            listRecipes: lrResp.results,
            comments: cResp.results,
        });
    }, [page]);

    let activity = <Loading />;
    if (content) {
        activity = (
            <div className="activity-pane">
                <Activity
                    showTitle={ true }
                    comments={ content.comments }
                    listRecipes={ content.listRecipes }
                    recipes={ content.recipes }
                />
                { /* TODO: Fix how we load more activities */ }
                <div style={{ textAlign: 'center' }}>
                <Button type="primary" onClick={ () => setPage(page + 1) }>
                    More
                </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="Home">
            <Card className="home-main">
                <SearchBar
                    total={ content ? content.total : null }
                    subtext={ 'e.g. cynar, Last Word, or mezcal' }
                    setValue={ (q) => history.push('/recipes/?search=' + encodeURIComponent(q), {}) }
                />
                <NavGroup />
            </Card>
            <Card className="home-activity">
                { activity }
            </Card>
        </div>
    );
}
