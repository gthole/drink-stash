import React, { useState } from 'react';
import './style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faGripVertical } from '@fortawesome/free-solid-svg-icons'
import { AutoComplete } from 'components/AutoComplete';
import { FormWrapper, Input, Select } from 'components/Forms';


function QuantityRow({
    index,
    quantity,
    ingredients,
    uom,
    error,
    setQuantity,
    removeQuantity,
    dragIndex,
    setDragIndex,
    reorder,
}) {
    function update(attr, value) {
        quantity[attr] = value;
        setQuantity(quantity);
    }

    return (
        <div className={ 'QuantityRow' + (dragIndex === index ? ' dragging' : '') } id={ `quantity-${index}` }>
            <div className="reorder"
                 draggable="true"
                 onDragStart={ (ev) => setDragIndex(index) } // Set the dragged quantity index
                 onDragEnter={ () => reorder(index) } // Reorder the list when we hover
                 onDragEnd={ () => setDragIndex(null) } // Clear the dragged quantity index
                 onDragOver={ (ev) => ev.preventDefault()} // Prevent browser from animating the div back
            >
                <FontAwesomeIcon icon={ faGripVertical } />
            </div>
            <div className="amount">
                <Input
                    value={ quantity.amount }
                    onChange={ (ev) => update('amount', ev.target.value) }
                    error={ error ? error.amount : null }
                />
            </div>
            <div className="unit">
                <Select
                    choices={ uom }
                    value={ quantity.unit }
                    onChange={ (ev) => update('unit', ev.target.value) }
                    error={ error ? error.unit : null }
                />
            </div>
            <div className="ingredient">
                <AutoComplete
                    index={ index }
                    value={ quantity.ingredient }
                    setValue={ (v) => update('ingredient', v) }
                    dataSource={ ingredients }
                    error={ error ? error.ingredient : null }
                />
                <div className="remove-quantity" onClick={ () => removeQuantity() }>
                    <FontAwesomeIcon icon={ faTimes } />
                </div>
            </div>
        </div>
    );
}

export function QuantitySet({quantities, ingredients, error, uom, setQuantities}) {
    const [dragIndex, setDragIndex] = useState(null);

    function setQuantity(q, index) {
        quantities[index] = q;
        setQuantities(quantities);
    }

    function removeQuantity(index) {
        quantities.splice(index, 1)
        setQuantities(quantities);
    }

    function reorder(index) {
        if (dragIndex === null || dragIndex === index) return;
        const moved = quantities.splice(dragIndex, 1)[0];
        quantities.splice(index, 0, moved);
        setQuantities([...quantities]);
        setDragIndex(index);
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
                            error={ error ? error[i] : null }
                            dragIndex={ dragIndex }
                            setDragIndex={ setDragIndex }
                            reorder={ reorder }
                        />
                    ))
                }
            </FormWrapper>
        </div>
    );
}
