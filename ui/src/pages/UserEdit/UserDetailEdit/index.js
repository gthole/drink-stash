import React from 'react';
import { Input, Button } from 'components/Forms';

export function UserDetailEdit({user, update, save}) {
    return (
        <div className="UserDetailEdit">
            <Input
                label="First Name"
                value={ user.first_name }
                onChange={ (ev) => {
                    user.first_name = ev.target.value;
                    update(user);
                }}
            />
            <Input
                label="Last Name"
                value={ user.last_name }
                onChange={ (ev) => {
                    user.last_name = ev.target.value;
                    update(user);
                }}
            />
            <Input
                label="Email"
                type="email"
                value={ user.email }
                onChange={ (ev) => {
                    user.email = ev.target.value;
                    update(user);
                }}
            />
            <Button
                type="primary"
                onClick={ () => save() }
                children="Save"
            />
        </div>
    );
}
