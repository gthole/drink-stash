import React, { useState, useContext, useEffect } from 'react';
import './style.css';
import { useParams, Link, Redirect } from 'react-router-dom';
import { Card } from 'components/Card';
import { ProfileImage } from 'components/ProfileImage';
import { PageTitle, Description } from 'components/Structure';
import { AppContext } from 'context/AppContext';
import { ListRecipeCard } from 'pages/ListDetails/ListRecipeCard';
import { services } from 'services';

export function ListDetails() {
    const { currentUser } = useContext(AppContext);
    const { listUsername, id } = useParams();
    const [content, setContent] = useState(null);

    useEffect(() => {
        Promise.all([
            services.lists.getById(id),
            services.listRecipes.getPage({user_list: id}),
        ]).then(([list, listRecipeResp]) => {
            setContent({
                canEdit: list.user.id === currentUser.user_id,
                list: list,
                listRecipes: listRecipeResp.results,
            });
        });
    }, [id, currentUser.user_id])

    if (!content) return '';
    if (listUsername !== content.list.user.username) {
        return <Redirect to={ `/users/${content.list.user.username}/lists/${id}` } />
    }

    return (
        <div className="ListDetails">
            <Card className="ListInfo">
                <PageTitle>{ content.list.name }</PageTitle>
                <div className="list-count">
                    { content.list.recipe_count }&nbsp;
                    { content.list.recipe_count === 1 ? 'Recipe' : 'Recipes' }
                </div>
                <Description>{ content.list.description }</Description>
                <div className="list-owner">
                    <ProfileImage user={ content.list.user } />
                    <div>
                        by <Link to={ `/users/${content.list.user.username}` }>
                            { content.list.user.first_name } { content.list.user.last_name }
                        </Link>
                    </div>
                </div>
            </Card>
            <Card>
                {
                    content.listRecipes.map((lr) => (
                        <ListRecipeCard listRecipe={ lr } canEdit={ content.canEdit }/>
                    ))
                }
            </Card>
        </div>
    );
}
