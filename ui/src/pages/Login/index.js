import React, { useState, useContext } from 'react';
import './style.css';
import splash from './img/splash.jpg';
import { Redirect } from 'react-router-dom';
import { Card } from 'components/Structure';
import { Input, Button } from 'components/Forms';
import { AppContext } from 'context/AppContext';
import { services } from 'services';

export function Login() {
    const { currentUser, refreshUser, addAlert } = useContext(AppContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    if (currentUser) {
        return <Redirect to="/" />
    }

    function submit(ev) {
        if (ev) ev.preventDefault();
        services.auth.login({username, password})
            .then(() => refreshUser())
            .catch((e) => addAlert('warn', 'Login was unsuccessful.'));
    }

    return (
        <div
                className="Login"
                style={{backgroundImage: `url(${splash})`}}>
            <div className="login-inner">
                <div className="login-header">
                    Drink<br/>Stash
                </div>
                <Card className="login-auth-form">
                    <form onSubmit={ submit }>
                        <Input
                            value={username}
                            placeholder={'Username'}
                            onChange={(ev) => setUsername(ev.target.value)}
                        />
                        <Input
                            type="password"
                            placeholder={'Password'}
                            value={password}
                            onChange={(ev) => setPassword(ev.target.value)}
                        />
                        <div className="button-row">
                            <Button type="primary" onClick={() => submit()}>Login</Button>
                            <div className="forgot-password">
                                <a href="/accounts/password_reset/">Forgot password?</a>
                            </div>
                        </div>
                    </form>
                </Card>
                <div className="credits">
                    <div className="login-photo-credit">
                        Photo by <a href="https://unsplash.com/@arobj?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Adam Jaime</a> on <a href="/s/photos/cocktail?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a>
                    </div>
                    <div>
                        Icons by <a href="http://www.freepik.com/" title="Freepik">Freepik</a> on <a href="https://www.flaticon.com/" title="Flaticon">flaticon.com</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
