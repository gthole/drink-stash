import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from 'components/Modal';
import { AppContext } from 'context/AppContext';
import { services } from 'services';

export function HelpContent({ user, welcome }) {
    const lead = welcome ? <p>Thanks for joining Drink Stash!</p> : '';

    return (
        <div className="HelpContent" style={{ padding: '0 20px' }}>
            { lead }
            <p>Get started by <Link to={ `/users/${user.username}/edit` }>
               updating your profile</Link>and adding a profile picture.
            </p>
            <p>If you're new to cocktail making, one of the best ways to find
               recipes to make is to put the bottles and ingredients you own
               into <Link to={ `/users/${user.username}/cabinet` }>
               your liqour cabinet</Link>and then search filter
               with <code>cabinet = true</code>.
            </p>
            <p>Please comment on the drinks you try and add your own recipes.
               It's more fun if you contribute. So – play, don't lurk!</p>
            <p>Happy drinking!</p>
        </div>
    );
}

export function HelpModal({ show, setShowHelp }) {
    const { currentUser, profile, updateProfile } = useContext(AppContext);

    if (!show && !profile?.show_welcome) return '';

    async function close() {
        // Close the modal, update the context, and patch the user's profile
        setShowHelp(false);
        if (profile?.show_welcome) {
            updateProfile({show_welcome: false});
            const user = await services.users.getById(currentUser.user_id);
            user.profile.show_welcome = false;
            await services.users.update(user);
        }
    }

    return (
        <Modal
            show={ true }
            close={ close }
            title={ profile?.show_welcome ? 'Welcome to Drink Stash!' : 'Drink Stash Help' }
            body={
                <HelpContent
                    user={ currentUser }
                    welcome={ profile?.show_welcome }
                />
            }
        />
    )
}
