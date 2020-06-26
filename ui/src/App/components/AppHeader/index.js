import React from 'react';
import './style.css';
import { useHistory, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { Menu } from './Menu';
import { AuthService } from '../../../services/auth';

const authService = new AuthService();

export function AppHeader() {
    const history = useHistory();

    if (!authService.isLoggedIn()) {
        return '';
    }

    return (
        <header className="App-header">
            <div className="header-back" onClick={ () => history.goBack() }>
                <FontAwesomeIcon icon={ faChevronLeft }/>
            </div>
            <Link to="/" className="home-link">Drink Stash</Link>
            <Menu />
        </header>
    );
}
