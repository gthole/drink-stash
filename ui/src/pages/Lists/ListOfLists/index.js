import React, { useContext } from 'react';
import { ListCount } from 'components/ListInfo/ListCount';
import { Button } from 'components/Forms';
import { PageTitle, Placeholder } from 'components/Structure';
import { AppContext } from 'context/AppContext';

export function ListCard({ list, onClick }) {
    return (
        <div className="ListCard" onClick={ onClick }>
            <div className="list-name">
                { list.name }
            </div>
            <div className="list-description">
                { list.description }
            </div>
            <ListCount list={ list }/>
        </div>
    );
}

export function ListOfLists({user, lists, select}) {
    const { currentUser } = useContext(AppContext);
    let button = '';
    if (user.id === currentUser.user_id) {
        button = (
            <div className="new-list">
                <Button
                    type="primary"
                    to={ `/users/${user.id}/lists/new` }
                    children={'New List'}
                />
            </div>
        );
    }

    return (
        <div className="ListOfLists">
            <div className="list-of-lists-header">
                <PageTitle>
                    {user.first_name} {user.last_name}'s Lists
                </PageTitle>
                { button }
            </div>
            {
                lists.map((l) => (
                    <ListCard
                        key={ 'list-card-' + l.id }
                        list={ l }
                        onClick={ () => select(l) }
                    />
                ))
            }
            <Placeholder children="No lists yet!" condition={ lists.length === 0 }/>
        </div>
    );
}
