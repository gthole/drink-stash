import React, { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { ListInfo } from 'components/ListInfo';
import { AppContext } from 'context/AppContext';
import { useAlertedEffect } from 'hooks/useAlertedEffect';
import { services } from 'services';

export function ListDetails() {
    const { listUsername, id } = useParams();
    const { currentUser } = useContext(AppContext);
    const [list, setList] = useState();

    useAlertedEffect(async () => {
        const l = await services.lists.getById(id);
        setList(l);
    }, [id, currentUser.user_id])

    return <ListInfo list={ list } listUsername={ listUsername } />
}
