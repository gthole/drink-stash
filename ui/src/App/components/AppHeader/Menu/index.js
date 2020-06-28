import React, { useState } from 'react';
import './style.css'
import { Link } from 'react-router-dom';
import OutsideClickHandler from 'react-outside-click-handler';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons'
import { services } from '../../../../services';

export function Menu({user, setUser}) {
    const [open, setOpen] = useState(false);
    const admin = user.is_staff ? <Link className="bordered" to="/admin/">Site Admin</Link> : '';

    function signout(ev) {
        services.auth.logout();
        setUser(null);
    }

    return (
        <div className='Menu'>
            <FontAwesomeIcon icon={ faBars } onClick={ () => setOpen(true) }/>
            <OutsideClickHandler onOutsideClick={() => setOpen(false)}>
                <div className={'menu-content ' + (open ? 'menu-open' : 'menu-closed') }>
                    <div className="menu-inner" onClick={ () => setOpen(false) } >
                        <div className="menu-close-button">
                            <FontAwesomeIcon icon={ faTimes } />
                        </div>
                        <Link to={`/users/${ user.username }`}>
                            Your profile
                        </Link>
                        <Link to="/new">
                            Add new recipes
                        </Link>
                        <Link to={`/users/${ user.username }/lists`}>
                            Your lists
                        </Link>
                        <Link to={`/users/${ user.username }/cabinet`}>
                            Manage your liquor cabinet
                        </Link>
                        { admin }
                        <a href="/" className="bordered" onClick={ signout }>
                            Sign out
                        </a>
                    </div>
                </div>
            </OutsideClickHandler>
        </div>
    );
}
