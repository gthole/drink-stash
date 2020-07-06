import React, { useState, useEffect, useContext } from 'react';
import './style.css';
import { Redirect, useParams, useHistory } from 'react-router-dom';
import { Button } from 'components/Forms';
import { Card } from 'components/Structure';
import { AppContext } from 'context/AppContext';
import { ProfileImageUpload } from 'pages/UserEdit/ProfileImageUpload';
import { UserDetailEdit } from 'pages/UserEdit/UserDetailEdit';
import { User } from 'services/users';
import { services } from 'services';

export function UserEdit() {
    const { currentUser } = useContext(AppContext);
    const { username } = useParams();
    const history = useHistory();
    const [user, setUser] = useState(null);

    useEffect(() => {
        services.users.getById(username).then((u) => setUser(u));
    }, [username]);

    function save() {
        services.users.update(user).then(() => {
            history.push(`/users/${user.username}`, {});
        });
    }

    if (!user) return '';
    if (user.id !== currentUser.user_id) {
        return <Redirect to="/" />
    }

    const update = (u) => setUser(new User(u));

    // TODO: Remove nbsp
    return (
        <div className="UserEdit">
            <Card className="profile-image">
                <ProfileImageUpload
                    user={ user }
                    update={ update }
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
