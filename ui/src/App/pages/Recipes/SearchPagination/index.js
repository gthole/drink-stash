import React from 'react';
import './style.css';
import { Button } from '../../../components/Forms';

export function SearchPagination({page, per_page, total, setPage}) {
    let next = '';
    if (page * per_page < total) {
        next = (
            <Button type={'outline'} onClick={() => setPage(page + 1)}>
                Next
            </Button>
        );
    }

    let prev = '';
    if (page > 1) {
        prev = (
            <Button type={'outline'} onClick={() => setPage(page - 1)}>
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
