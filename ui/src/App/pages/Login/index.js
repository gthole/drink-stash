import React, { useState } from 'react';
import './style.css';
import { useHistory } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Input, Button } from '../../components/Forms';
import { services } from '../../../services';

export function Login({refreshUser}) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const history = useHistory();
    if (services.auth.isLoggedIn()) {
        history.push('/', {});
    }

    async function submit() {
        try {
            await services.auth.login({username, password});
            refreshUser();
            history.push('/', {});
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <div className="Login">
            <div className="login-inner">
                <div className="login-header">
                    Drink<br/>Stash
                </div>
                <Card className="login-auth-form">
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
                </Card>
                <div className="login-photo-credit">
                    Photo by <a href="https://unsplash.com/@arobj?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Adam Jaime</a> on <a href="/s/photos/cocktail?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText">Unsplash</a>
                </div>
            </div>
        </div>
    );
}
