import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from 'components/Modal';
import { AppContext } from 'context/AppContext';
import { services } from 'services';

export function WelcomeContent({ user }) {

    return (
        <div className="WelcomeContent" style={{ padding: '0 20px' }}>
            <p>Thanks for joining Drink Stash!</p>
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

export function WelcomeModal() {
    const { currentUser, profile, updateProfile } = useContext(AppContext);

    if (!profile?.show_welcome) return '';

    async function close() {
        // Close the modal, update the context, and patch the user's profile
        updateProfile({show_welcome: false});
        const user = await services.users.getById(currentUser.user_id);
        user.profile.show_welcome = false;
        await services.users.update(user);
    }

    return (
        <Modal
            show={ profile.show_welcome }
            close={ close }
            title="Welcome to Drink Stash!"
            body={ <WelcomeContent user={ currentUser } /> }
        />
    )
}
