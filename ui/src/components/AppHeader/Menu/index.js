import React, { useState } from 'react';
import './style.css'
import { Link } from 'react-router-dom';
import OutsideClickHandler from 'react-outside-click-handler';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faTimes, faCircle } from '@fortawesome/free-solid-svg-icons'
import { services } from 'services';

export function Menu({currentUser}) {
    const [open, setOpen] = useState(false);
    const admin = currentUser.is_staff ? <a className="bordered" href="/admin/">Site Admin</a> : '';

    function signout(ev) {
        services.auth.logout();
    }

    let badge;
    if (!currentUser.image) {
        badge = (
            <div className="badge">
                <FontAwesomeIcon icon={ faCircle }/>
            </div>
        );
    }

    return (
        <div className='Menu'>
            <div className="hamburger">
                <FontAwesomeIcon icon={ faBars } onClick={ () => setOpen(true) }/>
                { badge }
            </div>
            <OutsideClickHandler onOutsideClick={() => setOpen(false)}>
                <div className={'menu-content ' + (open ? 'menu-open' : 'menu-closed') }>
                    <div className="menu-inner" onClick={ () => setOpen(false) } >
                        <div className="menu-close-button">
                            <FontAwesomeIcon icon={ faTimes } />
                        </div>
                        <Link to={`/users/${ currentUser.username }`}>
                            Your profile
                        </Link>
                        <div className="profile-link">
                            <Link to={`/users/${ currentUser.username }/edit`}>
                                Update your profile
                            </Link>
                            { badge }
                        </div>
                        <Link to="/new">
                            Add new recipes
                        </Link>
                        <Link to={`/users/${ currentUser.username }/lists`}>
                            Your lists
                        </Link>
                        <Link to={`/users/${ currentUser.username }/cabinet`}>
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
