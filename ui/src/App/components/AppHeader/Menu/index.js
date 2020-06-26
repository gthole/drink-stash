import React, { useState } from 'react';
import './style.css'
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons'
import { AuthService } from '../../../../services/auth';

const authService = new AuthService();

export function Menu() {
    const [open, setOpen] = useState(false);
    const user = authService.getUserData();
    const admin = '';

    function signout(ev) {
        authService.logout();
    }

    return (
        <div className='Menu'>
            <FontAwesomeIcon icon={ faBars } onClick={ () => setOpen(true) }/>
            <div className={'menu-content ' + (open ? 'menu-open' : 'menu-closed') }>
                <div className="menu-inner">
                    <div className="menu-close-button" onClick={ () => setOpen(false) }>
                        <FontAwesomeIcon icon={ faTimes } onClick={ () => setOpen(true) }/>
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
                    <a href="/" onClick={ signout }>
                        Sign out
                    </a>
                </div>
            </div>
        </div>
    );
}
