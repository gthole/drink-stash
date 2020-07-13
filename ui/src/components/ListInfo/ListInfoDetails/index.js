import React from 'react';
import { stringify } from 'querystring';
import { Link } from 'react-router-dom';
import { Button } from 'components/Forms';
import { ProfileImage } from 'components/ProfileImage';
import { ListCount } from 'components/ListInfo/ListCount';
import { Card, PageTitle, Description } from 'components/Structure';

export function ListInfoDetails({list, canEdit}) {
    const link = stringify({search: `list = ${list.id}[List = ${list.name}]`});
    return (
        <Card className="list-info-details">
            <PageTitle>{ list.name }</PageTitle>
            <ListCount list={ list }/>
            <Description>{ list.description }</Description>
            <div className="list-searches">
                {
                    list.recipe_count > 0 ?
                    <Link to={ `/recipes?${ link }` }>
                        Filter recipes to this list
                    </Link> :
                    ''
                }
            </div>
            <div className="list-owner-row">
                <div className="list-owner">
                    <ProfileImage user={ list.user } />
                    <div>
                        by <Link to={ `/users/${list.user.username}` }>
                            { list.user.first_name } { list.user.last_name }
                        </Link>
                    </div>
                </div>
                {
                    canEdit ?
                    <Button
                            type="outline small"
                            to={ `/users/${list.user.username}/lists/${list.id}/edit` }>
                        Edit
                    </Button> :
                    ''
                }
            </div>
        </Card>
    );
}
