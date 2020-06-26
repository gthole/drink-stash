import React, { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import './style.css';
import { Activity } from '../../components/Activity';
import { Card } from '../../components/Card';
import { Button } from '../../components/Forms';
import { SearchBar } from '../../components/SearchBar';
import { CommentService } from '../../../services/comments';
import { ListRecipeService } from '../../../services/lists';
import { RecipeService } from '../../../services/recipes';

const commentService = new CommentService();
const listRecipeService = new ListRecipeService();
const recipeService = new RecipeService();

export function Home() {
    const [content, setContent] = useState(null);
    const [page, setPage] = useState(1);
    const history = useHistory();

    useEffect(() => {
        const params = {
            page,
            per_page: 30,
            orderring: '-created'
        };
        Promise.all([
            commentService.getPage(params),
            listRecipeService.getPage(params),
            recipeService.getPage(params),
        ]).then(([cResp, lrResp, rResp]) => {
            setContent({
                page: page,
                total: rResp.count,
                recipes: rResp.results,
                listRecipes: lrResp.results,
                comments: cResp.results,
            });
        });
    }, [page]);

    let activity = '';
    if (content) {
        activity = (
            <div>
                <Activity
                    showTitle={ true }
                    comments={ content.comments }
                    listRecipes={ content.listRecipes }
                    recipes={ content.recipes }
                />
                <Button type="primary" onClick={ () => setPage(page + 1) }>
                    Next
                </Button>
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
            </Card>
            <Card className="home-activity">
                { activity }
            </Card>
        </div>
    );
}
