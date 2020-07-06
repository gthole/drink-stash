import React, { useState, useEffect, useContext } from 'react';
import './style.css';
import { Activity } from 'components/Activity';
import { Card, Description } from 'components/Structure';
import { TagList } from 'components/TagList';
import { CommentForm } from 'components/RecipeInfo/CommentForm';
import { Quantities } from 'components/RecipeInfo/Quantities';
import { ManageLists } from 'components/RecipeInfo/ManageLists';
import { RecipeMenu } from 'components/RecipeInfo/RecipeMenu';
import { Source } from 'components/RecipeInfo/Source';
import { AppContext } from 'context/AppContext';
import { services } from 'services';
import { Comment } from 'services/comments';

export function RecipeInfo({recipe, refresh}) {
    const { currentUser } = useContext(AppContext);
    const [content, setContent] = useState({});
    const [multiplier, setMultiplier] = useState(1);

    useEffect(() => {
        if (!recipe) return;
        Promise.all([
            services.comments.getPage({recipe: recipe.id}),
            services.listRecipes.getPage({recipe: recipe.id}),
            services.lists.getPage({user: currentUser.user_id}),
            services.books.getPage({owner: true})
        ]).then(([commentResp, listRecipeResp, listResp, bookResp]) => {
            const c = commentResp.results.find(c => c.user.id === currentUser.user_id);
            const b = bookResp.results.find(b => b.id === recipe.book.id);
            setContent({
                recipe_id: recipe.id,
                can_comment: !Boolean(c),
                can_edit: Boolean(b),
                comments: commentResp.results,
                lists: listResp.results,
                listRecipes: listRecipeResp.results
            });
        })
    }, [recipe, currentUser.user_id])

    async function submitComment(text) {
        const comment = new Comment({
            recipe: {id: recipe.id},
            text: text
        });
        const created = await services.comments.create(comment);
        content.comments.push(created);
        content.can_comment = false;
        setContent({...content});
        if (refresh) refresh();
    }

    if (!recipe) return '';

    return (
        <div className="RecipeInfo">
            <Card>
                <RecipeMenu
                    recipe={ recipe }
                    canEdit={ content.can_edit }
                    multiplier={ multiplier }
                    setMultiplier={ setMultiplier }
                />
                <div className="title">
                    { recipe.name }
                </div>
                <Source recipe={recipe} />
                <Quantities
                    quantities={ recipe.quantities }
                    multiplier={ multiplier }
                />
                <div className="directions">
                    { recipe.directions }
                </div>
                <TagList tags={ recipe.tags } />
                <Description>{ recipe.description }</Description>
                <ManageLists
                    recipe={ recipe }
                    listRecipes={ content.listRecipes }
                    lists={ content.lists }
                    setContent={ (c) => setContent({...content, ...c}) }
                />
            </Card>
            <Card>
                <CommentForm
                    show={ content.can_comment }
                    submit={ submitComment }
                />
                <Activity
                    showTitle={ false }
                    comments={ content.comments }
                    listRecipes={ content.listRecipes }
                />
            </Card>
        </div>
    );
}
