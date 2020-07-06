import React from 'react';

export function ProfileImage({user, size}) {
    return (
        <img
            style={{width: (size || 40) + 'px', borderRadius: '999px'}}
            src={ user.image || "/static/img/generic.png" }
            alt={ `${user.first_name} ${user.last_name}` }
        />
    );
}
