import React from 'react';
import './style.css';

export function FormWrapper({label, subtext, children}) {
    return (
        <div className="Forms FormWrapper">
            { label ? <label htmlFor={''}>{ label }</label> : '' }
            { children }
            { subtext ? <div className="subtext">{ subtext }</div> : '' }
        </div>
    );
}

export function TextArea({label, subtext, expanded, ...rest}) {
    return (
        <FormWrapper label={label} subtext={subtext}>
            <textarea
                className={'TextArea' + (expanded ? ' textarea-large' : '')}
                {...rest}
            />
        </FormWrapper>
    );
}

export function Input({label, subtext, ...rest}) {
    return (
        <FormWrapper label={label} subtext={subtext}>
            <input className="Input" {...rest}/>
        </FormWrapper>
    );
}

export function Select({label, subtext, choices, display, select, defaultValue, value, ...rest}) {
    return (
        <FormWrapper label={label} subtext={subtext}>
            <select className="Select" value={ value } {...rest}>
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

export function Button({ type, href, onClick, children, className}) {
    return (
        <button
            className={'Button button-' + type + (className ? ' ' + className : '')}
            onClick={ onClick }
            children={children}
        />
    );
}
