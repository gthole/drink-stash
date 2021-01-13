import React, { useContext, useState } from 'react';
import './style.css';
import { useHistory, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { AppContext } from 'context/AppContext';
import { Menu } from 'components/AppHeader/Menu';
import { HelpModal } from 'components/AppHeader/HelpModal';

export function AppHeader() {
    const { currentUser, refreshUser } = useContext(AppContext);
    const [showHelp, setShowHelp] = useState(false);
    const history = useHistory();

    if (!currentUser) {
        return '';
    }

    return (
        <header className="App-header">
            <div className="header-back" onClick={ () => history.goBack() }>
                <FontAwesomeIcon icon={ faChevronLeft }/>
            </div>
            <Link to="/" className="home-link">Drink Stash</Link>
            <Menu
                currentUser={ currentUser }
                refreshUser={ refreshUser }
                showHelp={ () => setShowHelp(true) }
            />
            <HelpModal show={ showHelp } setShowHelp={ setShowHelp }/>
        </header>
    );
}
