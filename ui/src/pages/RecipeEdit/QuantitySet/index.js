import React from 'react';
import './style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { AutoComplete } from 'components/AutoComplete';
import { FormWrapper, Input, Select } from 'components/Forms';

export function QuantityRow({index, quantity, ingredients, uom, setQuantity, removeQuantity}) {
    function update(attr, value) {
        quantity[attr] = value;
        setQuantity(quantity);
    }
    return (
        <div className="QuantityRow">
            <div className="amount">
                <Input
                    value={ quantity.amount }
                    onChange={ (ev) => update('amount', ev.target.value) }
                />
            </div>
            <div className="unit">
                <Select
                    choices={ uom }
                    value={ quantity.unit }
                    onChange={ (ev) => update('unit', ev.target.value) }
                />
            </div>
            <div className="ingredient">
                <AutoComplete
                    index={ index }
                    value={ quantity.ingredient }
                    setValue={ (v) => update('ingredient', v) }
                    dataSource={ ingredients.map(i => i.name) }
                />
                <div className="remove-quantity" onClick={ () => removeQuantity() }>
                    <FontAwesomeIcon icon={ faTimes } />
                </div>
            </div>
        </div>
    );
}

export function QuantitySet({quantities, ingredients, uom, setQuantities}) {
    function setQuantity(q, index) {
        quantities[index] = q;
        setQuantities(quantities);
    }

    function removeQuantity(index) {
        quantities.splice(index, 1)
        setQuantities(quantities);
    }

    return (
        <div className="QuantitySet">
            <FormWrapper label="Ingredients">
                {
                    quantities.map((q, i) => (
                        <QuantityRow
                            index={ i }
                            key={ 'quantity-' + i }
                            uom={ uom }
                            ingredients={ ingredients }
                            quantity={ q }
                            setQuantity={ (q) => setQuantity(q, i) }
                            removeQuantity={ () => removeQuantity(i) }
                        />
                    ))
                }
            </FormWrapper>
        </div>
    );
}
