import React, { useState, useContext } from 'react';
import './style.css';
import { Redirect, useParams, useHistory } from 'react-router-dom';
import { Button } from 'components/Forms';
import { Card } from 'components/Structure';
import { AppContext } from 'context/AppContext';
import { useAlertedEffect } from 'hooks/useAlertedEffect';
import { ProfileImageUpload } from 'pages/UserEdit/ProfileImageUpload';
import { UserDetailEdit } from 'pages/UserEdit/UserDetailEdit';
import { User } from 'services/users';
import { services } from 'services';

export function UserEdit() {
    const { currentUser, updateProfile, addAlert } = useContext(AppContext);
    const { username } = useParams();
    const history = useHistory();
    const [user, setUser] = useState(null);

    useAlertedEffect(async () => {
        const u = await services.users.getById(username);
        setUser(u);
    }, [username]);

    function save() {
        services.users.update(user).then(() => {
            sessionStorage.clear();
            history.push(`/users/${user.username}`, {});
        });
    }

    if (!user) return '';
    if (user.id !== currentUser.user_id) {
        return <Redirect to="/" />
    }

    const update = (u) => {
        if (u.display_mode !== user.profile.display_mode) {
            updateProfile({display_mode: u.display_mode});
            u.profile.display_mode = u.display_mode;
        }
        setUser(new User(u));
    }

    return (
        <div className="UserEdit">
            <Card className="profile-image">
                <ProfileImageUpload
                    user={ user }
                    update={ update }
                    addAlert={ addAlert }
                />
            </Card>
            <Card className="user-details-edit">
                <UserDetailEdit
                    user={ user }
                    update={ update }
                    save={ save }
                />
                <div className="change-password">
                    <Button
                        type="outline small"
                        to="/accounts/password_change/"
                        href="/accounts/password_change/"
                        children="Change Password"
                    />
                </div>
            </Card>
        </div>
    );
}
