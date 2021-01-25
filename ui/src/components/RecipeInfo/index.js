import React, { useState, useContext } from 'react';
import './style.css';
import { Activity } from 'components/Activity';
import { Card, Description } from 'components/Structure';
import { CommentForm } from 'components/RecipeInfo/CommentForm';
import { Quantities } from 'components/RecipeInfo/Quantities';
import { ManageLists } from 'components/RecipeInfo/ManageLists';
import { ManageTags } from 'components/RecipeInfo/ManageTags';
import { RecipeMenu } from 'components/RecipeInfo/RecipeMenu';
import { Source } from 'components/RecipeInfo/Source';
import { useAlertedEffect } from 'hooks/useAlertedEffect';
import { AppContext } from 'context/AppContext';
import { services } from 'services';
import { Comment } from 'services/comments';

export function RecipeInfo({recipe, addComment, setUserList}) {
    const { currentUser } = useContext(AppContext);
    const [content, setContent] = useState({});
    const [multiplier, setMultiplier] = useState(1);
    const [reloadActivities, setReloadActivities] = useState(0);

    useAlertedEffect(async () => {
        if (!recipe) return;
        const [commentResp, listRecipeResp, listResp, bookResp] = await Promise.all([
            services.comments.getPage({recipe: recipe.id, user: currentUser.user_id}),
            services.listRecipes.getPage({recipe: recipe.id, user: currentUser.user_id}),
            services.lists.getPage({user: currentUser.user_id}), // Uses the cache
            services.books.getPage({owner: true}), // Uses the cache
        ]);
        const b = bookResp.results.find(b => b.id === recipe.book.id);
        setContent({
            recipe_id: recipe.id,
            can_comment: commentResp.count === 0,
            can_edit: Boolean(b),
            listRecipes: listRecipeResp.results,
            lists: listResp.results,
        });
    }, [recipe, currentUser.user_id])

    async function submitComment(text) {
        const comment = new Comment({
            recipe: {id: recipe.id},
            text: text
        });
        await services.comments.create(comment);
        content.can_comment = false;
        setContent({...content});
        if (addComment) addComment();
        setReloadActivities(reloadActivities + 1);
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
                <ManageTags recipe={ recipe } canEdit={ content.can_edit } />
                <Description>{ recipe.description }</Description>
                <ManageLists
                    recipe={ recipe }
                    listRecipes={ content.listRecipes }
                    lists={ content.lists }
                    setContent={ (c) => {
                        setContent({...content, ...c})
                        if (setUserList) setUserList(c.listRecipes.length);
                    }}
                />
            </Card>
            <Card>
                <CommentForm
                    show={ content.can_comment }
                    submit={ submitComment }
                />
                <Activity
                    showTitle={ false }
                    params={{ recipe: recipe.id, r: reloadActivities }}
                />
            </Card>
        </div>
    );
}
