import React from 'react';
import { Modal } from 'components/Modal';
import { Description } from 'components/Structure';

function HelpExample({description, examples, setValue}) {
    return <div>
        <p>{ description }</p>
        <Description>
            {
                examples.map((ex, i) => (
                    <div
                        key={ 'examples-' + i }
                        style={{cursor: 'pointer'}}
                        onClick={ () => setValue(ex) }
                        children={ ex }
                    />
                ))
            }
        </Description>
    </div>
}

export function SearchHelp({show, close, setValue}) {
    function setClose(ex) {
        setValue(ex, true);
        close();
    }

    return <div className="SearchHelp">
        <Modal
            show={ show }
            close={ close }
            title="Search Help"
            body={
                <div className="help-body">
                    <HelpExample
                        setValue={ setClose }
                        description="Simple queries will search the recipe name, description, ingredients, and directions"
                        examples={ ["yellow chartreuse", "last word", "collins glass"] }
                    />
                    <HelpExample
                        setValue={ setClose }
                        description="Search recipe descriptions only"
                        examples={ ["description = tiki"] }
                    />
                    <HelpExample
                        setValue={ setClose }
                        description="Search by directions"
                        examples={ ["directions = stir"] }
                    />
                    <HelpExample
                        setValue={ setClose }
                        description="You can filter by ingredient amounts too"
                        examples={ ["lemon juice > 1/2 oz", "orgeat = 1/4 oz"] }
                    />
                    <HelpExample
                        setValue={ setClose }
                        description="Adding the NOT keyword will exclude any recipes that match the search"
                        examples={ ["NOT juice", "NOT directions = shake"] }
                    />
                    <HelpExample
                        setValue={ setClose }
                        description="You can filter to your liquor cabinet"
                        examples={ ["cabinet = true"] }
                    />
                    <HelpExample
                        setValue={ setClose }
                        description="Filter to a given list by name or ID"
                        examples={ ["list = favorites", "list = 1"] }
                    />
                    <HelpExample
                        setValue={ setClose }
                        description="Adding the LIKE keyword will find cocktails similar to the ones matched by the search term"
                        examples={ ["LIKE craigie on main", "LIKE list = favorites"] }
                    />

                </div>
            }
        />
    </div>;
}
