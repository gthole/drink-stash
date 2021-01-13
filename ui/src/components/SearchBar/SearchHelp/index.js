import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Modal } from 'components/Modal';
import { SectionTitle, Description } from 'components/Structure';

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
                        description="Search by comment text"
                        examples={ ["comment = variation"] }
                    />
                    <HelpExample
                        setValue={ setClose }
                        description="Filter by ingredient and amounts"
                        examples={ ["ingredient = falernum", "lemon juice > 1/2 oz", "orgeat = 1/4 oz"] }
                    />
                    <SectionTitle children="Operators"/>
                    <HelpExample
                        setValue={ setClose }
                        description="Adding the NOT keyword will exclude any recipes that match the search"
                        examples={ ["NOT juice", "NOT directions = shake"] }
                    />
                    <HelpExample
                        setValue={ setClose }
                        description="Adding the LIKE keyword will find cocktails similar to the ones matched by the search term"
                        examples={ ["LIKE craigie on main", "LIKE list = favorites"] }
                    />
                    <HelpExample
                        setValue={ setClose }
                        description="You can match one term or another with the OR operator"
                        examples={ ["pineapple juice OR lime juice"] }
                    />
                    <SectionTitle children="Filters"/>
                    <p>Filters are available under the &nbsp;<FontAwesomeIcon icon={ faPlus } />&nbsp; icon,
                       but you can put them directly in the search bar too.</p>
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
                </div>
            }
        />
    </div>;
}
