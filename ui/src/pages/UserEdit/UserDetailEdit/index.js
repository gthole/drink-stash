import React from 'react';
import { Input, Button, RadioButtons } from 'components/Forms';

export function UserDetailEdit({user, update, save}) {
    return (
        <div className="UserDetailEdit">
            <Input
                label="First Name"
                id="firstname"
                value={ user.first_name }
                onChange={ (ev) => {
                    user.first_name = ev.target.value;
                    update(user);
                }}
            />
            <Input
                label="Last Name"
                id="lastname"
                value={ user.last_name }
                onChange={ (ev) => {
                    user.last_name = ev.target.value;
                    update(user);
                }}
            />
            <Input
                label="Email"
                id="email"
                type="email"
                value={ user.email }
                onChange={ (ev) => {
                    user.email = ev.target.value;
                    update(user);
                }}
            />
            <RadioButtons
                label="Display Mode"
                name="display_mode"
                value={ user.display_mode }
                onChange={ (m) => update({...user, display_mode: m}) }
                choices={[
                    {display: 'Light', value: 'light'},
                    {display: 'System Default', value: 'system'},
                    {display: 'Dark', value: 'dark'},
                ]}
            />
            <Button
                type="primary"
                onClick={ () => save() }
                children="Save"
            />
        </div>
    );
}
