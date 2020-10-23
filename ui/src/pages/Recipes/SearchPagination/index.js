import React from 'react';
import './style.css';
import { Button } from 'components/Forms';

// Scroll to the top of the recipe list on pagination change
function scrollTop() {
    setTimeout(() => {
        window.scrollTo({top: 0, behavior: 'smooth'});
        const el = document.getElementsByClassName('left')[0];
        if (el) {
            el.scrollTo({top: 0, behavior: 'smooth'})
        }
    }, 0);
}

export function SearchPagination({page, per_page, total, setPage}) {
    function click(page) {
        scrollTop();
        setPage(page);
    }

    let next = '';
    if (page * per_page < total) {
        next = (
            <Button type={'outline'} onClick={() => click(page + 1)}>
                Next
            </Button>
        );
    }

    let prev = '';
    if (page > 1) {
        prev = (
            <Button type={'outline'} onClick={() => click(page - 1)}>
                Previous
            </Button>
        );
    }

    return (
        <div className={'ListPagination' + (next ? ' hasNext' : '')}>
            {next}
            {prev}
        </div>
    );
}
