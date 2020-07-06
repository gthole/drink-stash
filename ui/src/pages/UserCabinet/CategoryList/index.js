import React from 'react';
import { Input } from 'components/Forms';
import { Card, PageTitle } from 'components/Structure';
import { categories } from 'pages/UserCabinet/categories';

export function CategoryList({ grouped, select, filter, setFilter }) {
    return (
        <Card className="CategoryList">
            <PageTitle>Liqour Cabinet</PageTitle>
            <Input
                value={ filter }
                onChange={ (ev) => setFilter(ev.target.value) }
                placeholder="Filter"
            />
            <div className="categories">
                {
                    Object.keys(grouped).map((g) => {
                        if (grouped[g].length === 0) return '';

                        return (
                            <div
                                    className="CategoryRow"
                                    key={'cat-' + g}
                                    onClick={ () => select(g) }>
                                { categories[g] } ({ grouped[g].length })
                            </div>
                        );
                    })
                }
            </div>
        </Card>
    );
}
