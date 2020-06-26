import React from 'react';
import './style.css';
import { RecipeActivity } from './RecipeActivity';
import { ListRecipeActivity } from './ListRecipeActivity';
import { CommentActivity } from './CommentActivity';

const SIX_HOURS = 6 * 60 * 60 * 1000;

function reduceBy(type, objs, compare) {
    return objs.reduce((res, o) => {
        const last = res.slice(-1)[0];
        const date = new Date(o.created);
        if (!last) {
            res.push({type, objs: [o], date});
            return res;
        }

        const shouldGroup = (
            compare(last.objs[0], o) &&
            Math.abs(last.date.valueOf() - date.valueOf()) < SIX_HOURS
        );

        if (shouldGroup) {
            last.objs.push(o);
        } else {
            res.push({type, objs: [o], date});
        }
        return res;
    }, []);
}

export function Activity({ recipes, listRecipes, comments, showTitle, showImage }) {
    // User adds several recipes at once
    const rGroups = reduceBy('recipe', recipes || [], (p, o) => (
        p.added_by.id === o.added_by.id
    ));
    // User puts a bunch of recipes into a list
    // Consider: User puts one recipe into a bunch of lists
    const lGroups = reduceBy('list', listRecipes || [], (p, o) => (
        p.user.id === o.user.id && p.list.id === o.list.id
    ));
    // Comments are always displayed one at a time
    const cGroups = (comments || []).map((c) => (
        {type: 'comment', objs: [c], date: new Date(c.updated)}
    ));

    // Combine, order, and render
    const activities = rGroups
        .concat(lGroups)
        .concat(cGroups)
        .sort((a, b) => a.date > b.date ? -1 : 1)
        .map((a, i) => {
            const k = 'activity-' + i;
            switch(a.type) {
                case 'recipe':
                    return <RecipeActivity key={ k } recipes={ a.objs } showTitle={ showTitle } />
                case 'list':
                    return <ListRecipeActivity key={ k } listRecipes={ a.objs } showTitle={ showTitle }/>
                case 'comment':
                    return <CommentActivity key={ k } comments={ a.objs } showTitle={ showTitle }/>
                default:
                    return '';
            }
        });

    return <div className="Activity">{ activities }</div>;
}
