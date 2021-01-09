import React from 'react';
import './style.css';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckSquare } from '@fortawesome/free-solid-svg-icons';
import { faSquare } from '@fortawesome/free-regular-svg-icons';

export function FormWrapper({label, id, subtext, children, error}) {
    return (
        <div className={ 'Forms FormWrapper' + (error ? ' form-error' : '') }>
            { label ? <label htmlFor={ id || '' }>{ label }</label> : '' }
            { children }
            { subtext ? <div className="subtext">{ subtext }</div> : '' }
            { Array.isArray(error) ? <div className="error-message">{ error[0] }</div> : '' }
        </div>
    );
}

export function TextArea({label, id, subtext, error, expanded, ...rest}) {
    return (
        <FormWrapper label={label} id={id} subtext={subtext} error={error}>
            <textarea
                className={'TextArea' + (expanded ? ' textarea-large' : '')}
                id={ id }
                {...rest}
            />
        </FormWrapper>
    );
}

export function Input({label, id, subtext, error, ...rest}) {
    return (
        <FormWrapper label={label} subtext={subtext} error={ error } id={ id }>
            <input className="Input" id={ id } {...rest}/>
        </FormWrapper>
    );
}

export function Select({label, id, subtext, error, choices, display, select, defaultValue, value, ...rest}) {
    return (
        <FormWrapper label={label} id={id} subtext={subtext} error={ error }>
            <select className="Select" id={id} value={ value } {...rest}>
                {
                    choices.map((c, i) => (
                        <option key={'opt-' + i} value={ select ? c[select] : c }>
                            { display ? c[display] : c }
                        </option>
                    ))
                }
            </select>
        </FormWrapper>
    );
}

export function RadioButtons({label, name, value, onChange, choices}) {
    const buttons = choices.map((c, i) => (
        <div className="radio-button-choice" key={ `rb-${i}` }>
            <input
                type="radio"
                id={ c.value }
                name={ name }
                value={ c.value }
                checked={ value === c.value }
                onChange={ () => onChange(c.value) }
            />
            <label htmlFor={ c.value }>{ c.display }</label>
        </div>
    ));
    return <FormWrapper label={ label } children={ buttons } />;
}

export function Button({ type, to, href, className, ...rest}) {
    const cn = 'Button button-' + type + (className ? ' ' + className : '')
    if (href) {
        const {children, ...other} = rest;
        return <a href={href} className={cn} {...other}>{ children }</a>
    }
    if (to) {
        return <Link to={to} className={cn} {...rest}/>
    }
    return <button className={ cn } {...rest} />
}

export function ButtonRow({children, ...rest}) {
    return <div className="ButtonRow">{ children }</div>;
}

export function CheckBox({value, ...rest}) {
    return (
        <div className={ 'CheckBox' + (value ? ' selected' : '') }>
            <FontAwesomeIcon icon={ value ? faCheckSquare : faSquare } {...rest}/>
        </div>
    );
}
