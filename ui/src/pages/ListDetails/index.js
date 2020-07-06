import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ListInfo } from 'components/ListInfo';
import { AppContext } from 'context/AppContext';
import { services } from 'services';

export function ListDetails() {
    const { listUsername, id } = useParams();
    const { currentUser } = useContext(AppContext);
    const [list, setList] = useState();

    useEffect(() => {
        services.lists.getById(id).then((l) => setList(l))
    }, [id, currentUser.user_id])

    return <ListInfo list={ list } listUsername={ listUsername } />
}
