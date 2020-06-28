import React, { useState, useEffect } from 'react';
import './style.css';
import { Activity } from '../Activity';
import { Card } from '../Card';
import { CommentForm } from './CommentForm';
import { Quantities } from './Quantities';
import { RecipeMenu } from './RecipeMenu';
import { Source } from './Source';
import { AuthService } from '../../../services/auth';
import { BookService } from '../../../services/books';
import { Comment, CommentService } from '../../../services/comments';
import { ListRecipeService } from '../../../services/lists';

const authService = new AuthService();
const bookService = new BookService();
const commentService = new CommentService();
const listRecipeService = new ListRecipeService();

export function RecipeInfo({recipe, refresh}) {
    const [content, setContent] = useState({});
    const [multiplier, setMultiplier] = useState(1);

    useEffect(() => {
        if (!recipe) return;
        Promise.all([
            commentService.getPage({recipe: recipe.id}),
            listRecipeService.getPage({recipe: recipe.id}),
            bookService.getPage({owner: true})
        ]).then(([commentResp, listRecipeResp, bookResp]) => {
            const user_id = authService.getUserData().user_id;
            const c = commentResp.results.find(c => c.user.id === user_id);
            const b = bookResp.results.find(b => b.id === recipe.book.id);
            setContent({
                recipe_id: recipe.id,
                can_comment: !Boolean(c),
                can_edit: Boolean(b),
                comments: commentResp.results,
                listRecipes: listRecipeResp.results
            });
        })
    }, [recipe])

    async function submitComment(text) {
        const comment = new Comment({
            recipe: {id: recipe.id},
            text: text
        });
        const created = await commentService.create(comment);
        content.comments.push(created);
        content.can_comment = false;
        setContent(Object.assign({}, content));
        refresh();
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
                <div className="description">
                    { recipe.description }
                </div>
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
