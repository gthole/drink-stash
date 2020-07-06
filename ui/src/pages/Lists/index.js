import React, { useState, useEffect } from 'react';
import './style.css';
import { parse } from 'querystring';
import { useParams, useHistory } from 'react-router-dom';
import { ListInfo } from 'components/ListInfo';
import { SidePanelList } from 'components/Structure';
import { ListOfLists } from 'pages/Lists/ListOfLists';
import { services } from 'services';

export function Lists() {
    const { listUsername } = useParams();
    const history = useHistory();
    const [content, setContent] = useState(null);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        async function fetch() {
            const user = await services.users.getById(listUsername);
            const listResp = await services.lists.getPage({user: user.id});
            setContent({
                user: user,
                lists: listResp.results
            });
        }
        fetch();
    }, [listUsername]);

    if (!content) return '';

    const show = parse(window.location.search.split('?')[1]).show;
    const listToShow = content.lists.find(l => show === '' + l.id);
    if (listToShow && (!selected || listToShow.id !== selected.id)) {
        setSelected(listToShow);
        return '';
    }

    function select(list) {
        const mobile = window.innerWidth < 1024;
        if (mobile) {
            return history.push(`/users/${listUsername}/lists/${list.id}`, {});
        }
        history.replace(`/users/${listUsername}/lists?show=${list.id}`);
        setSelected(list);
    }

    return (
        <SidePanelList
            className="Lists"
            left={
                <ListOfLists
                    select={ select }
                    {...content}
                />
            }
            right={
                <ListInfo
                    list={ selected }
                    listUsername={ listUsername }
                />
            }
        />
    );
}
