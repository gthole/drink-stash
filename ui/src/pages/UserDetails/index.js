import React, { useState, useContext } from 'react';
import './style.css'
import { useParams, useHistory } from 'react-router-dom';
import { Activity } from 'components/Activity';
import { Button } from 'components/Forms';
import { ProfileImage } from 'components/ProfileImage';
import { ResponsivePanes, Card, PageTitle } from 'components/Structure';
import { AppContext } from 'context/AppContext';
import { useAlertedEffect } from 'hooks/useAlertedEffect';
import { ListOfLists } from 'pages/Lists/ListOfLists';
import { services } from 'services';

export function UserDetails() {
    const [content, setContent] = useState(null);
    const { currentUser } = useContext(AppContext);
    const history = useHistory();
    const { username } = useParams();

    useAlertedEffect(async () => {
        const user = await services.users.getById(username);
        const [commentResp, listResp, lrResp] = await Promise.all([
            services.comments.getPage({user: user.id, per_page: 20}),
            services.lists.getPage({user: user.id, per_page: 5}),
            services.listRecipes.getPage({user_list__user: user.id, per_page: 20})
        ]);
        setContent({
            user,
            lists: listResp.results,
            comments: commentResp.results,
            listRecipes: lrResp.results,
        });
    }, [username]);

    if (!content) return '';

    let editButton;
    if (username === currentUser.username) {
        editButton = <div className="edit-link">
            <Button
                to={ `/users/${username}/edit` }
                type="outline"
                children="Edit Profile"
            />
        </div>
    }

    return (
        <ResponsivePanes className="UserDetails">
            <div className="first-pane">
                <Card className="user-data">
                    <ProfileImage size={ 128 } user={ content.user }/>
                    <div className="user-details">
                        <PageTitle>
                            {content.user.first_name} {content.user.last_name}
                        </PageTitle>
                        <div className="user-stats">
                            <div>Added { content.user.recipe_count } recipes.</div>
                            <div>Made { content.user.comment_count } comments.</div>
                        </div>
                        { editButton }
                    </div>
                </Card>
                <div className="user-lists">
                    <ListOfLists
                        lists={ content.lists }
                        user={ content.user }
                        select={ (l) => history.push(`/users/${username}/lists/${l.id}`, {}) }
                    />
                    {
                        content.lists.length ?
                        <div className="list-link">
                            <Button
                                type="outline"
                                to={ `/users/${username}/lists` }
                                children="All Lists"
                            />
                        </div> :
                        ''
                    }
                </div>
            </div>
            <Card className="second-pane">
              <Activity
                  showTitle={ true }
                  showImage={ false }
                  showPlaceholder={ true }
                  params={{ user: content.user.id }}
              />
            </Card>
        </ResponsivePanes>
    );
}
