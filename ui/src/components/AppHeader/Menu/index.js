import React, { useContext, useState } from 'react';
import './style.css'
import { Link } from 'react-router-dom';
import OutsideClickHandler from 'react-outside-click-handler';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faTimes, faCircle } from '@fortawesome/free-solid-svg-icons'
import { AppContext } from 'context/AppContext';
import { services } from 'services';

export function Menu({currentUser, showHelp}) {
    const [open, setOpen] = useState(false);
    const { profile } = useContext(AppContext);
    const admin = currentUser.is_staff ? <a className="bordered" href="/admin/">Site Admin</a> : '';

    function signout(ev) {
        services.auth.logout();
    }

    function clickShowHelp(ev) {
        ev.preventDefault();
        showHelp();
    }

    let badge;
    if (profile && !profile.image) {
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
                                Edit your profile
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
                        <div className="menu-link" onClick={ clickShowHelp }>
                            Help
                        </div>
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
