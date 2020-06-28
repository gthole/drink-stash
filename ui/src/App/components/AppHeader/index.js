import React from 'react';
import './style.css';
import { useHistory, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { Menu } from './Menu';

export function AppHeader({user, setUser}) {
    const history = useHistory();

    if (!user) {
        return '';
    }

    return (
        <header className="App-header">
            <div className="header-back" onClick={ () => history.goBack() }>
                <FontAwesomeIcon icon={ faChevronLeft }/>
            </div>
            <Link to="/" className="home-link">Drink Stash</Link>
            <Menu user={user} setUser={setUser}/>
        </header>
    );
}
