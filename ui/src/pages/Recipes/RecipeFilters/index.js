import React, { useState, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import './style.css';
import { Select, Button } from 'components/Forms';
import { services } from 'services';

function FilterButton({onClick}) {
    return <Button type="primary" children="Filter" onClick={onClick}/>;
}

function ListFilterOptions({lists, addFilter}) {
    const [value, setValue] = useState(lists[0].id);

    function onClick() {
        const list = lists.find(l => ('' + l.id) === ('' + value));
        addFilter(`list = ${list.id}[List = ${list.name}]`);
    }

    return (
        <div>
            <Select
                label={'Choose List'}
                choices={ lists }
                display="name"
                select="id"
                value={ value }
                onChange={(ev) => setValue(ev.target.value)}
            />
            {
                // TODO: Add a checkbox for the LIKE operator
            }
            <FilterButton onClick={ onClick }/>
        </div>
    );
}

function BookFilterOptions({books, addFilter}) {
    const [value, setValue] = useState(books[0].id);

    function onClick() {
        const book = books.find(b => ('' + b.id) === ('' + value));
        addFilter(`book = ${book.id}[Book = ${book.name}]`);
    }

    return (
        <div>
            <Select
                label={'Choose Book' }
                choices={ books }
                display="name"
                select="id"
                value={ value }
                onChange={(ev) => setValue(ev.target.value)}
            />
            <FilterButton onClick={ onClick }/>
        </div>
    );
}

function TagFilterOptions({tags, addFilter}) {
    const [value, setValue] = useState(tags[0]);

    return (
        <div>
            <Select
                label={ 'Choose Tag' }
                choices={ tags }
                value={ value }
                onChange={(ev) => setValue(ev.target.value) }
            />
            <FilterButton onClick={ () => addFilter(`Tag = ${value}`) }/>
        </div>
    );
}

/*
// TODO: Support this
function CommentFilterOptions({tags, addFilter}) {
    const [value, setValue] = useState(tags[0]);

    return (
        <div>
            <Select
                label={ 'Choose Tag' }
                choices={[
                    'Commented by Me',
                    'Commented by Others',
                    'Not Commented by Me',
                    'No Comments Yet',
                ]}
                value={ value }
                onChange={(ev) => setValue(ev.target.value) }
            />
            <FilterButton onClick={ () => addFilter(`Tag = ${value}`) }/>
        </div>
    );
}
*/

export function RecipeFilters({addFilter, expanded, setExpanded}) {
    const [filterType, setFilterType] = useState('Book');
    const [content, setContent] = useState(null);
    const user_id = services.auth.getUserData().user_id;

    useEffect(() => {
        Promise.all([
            services.lists.getPage({user: user_id}),
            services.books.getPage(),
            services.tags.getPage(),
        ]).then(([listResp, bookResp, tagResp]) => {
            setContent({
                lists: listResp.results,
                books: bookResp.results,
                tags: tagResp.results,
            });
        });
    }, [user_id]);

    if (!content) return '';

    let valSelect;
    if (filterType === 'List') {
        valSelect = <ListFilterOptions
            lists={ content.lists }
            addFilter={ addFilter }
        />
    } else if (filterType === 'Book') {
        valSelect = <BookFilterOptions
            books={ content.books }
            addFilter={ addFilter }
        />
    } else if (filterType === 'Tag') {
        valSelect = <TagFilterOptions
            tags={ content.tags }
            addFilter={ addFilter }
        />
    } else if (filterType === 'Cabinet') {
        valSelect = <FilterButton onClick={ () => addFilter('Cabinet = True') }/>
    }

    return (
        <CSSTransition
                    in={ expanded }
                    timeout={400}
                    classNames='openSection'
                    unmountOnExit>
            <div className="RecipeFilters">
                <Select
                    label={'Filter by'}
                    choices={['Book', 'Cabinet', 'List', 'Tag']}
                    value={ filterType }
                    onChange={(ev) => setFilterType(ev.target.value)}
                />
                {valSelect}
            </div>
        </CSSTransition>
    );
}
