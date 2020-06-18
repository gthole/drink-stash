import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { AuthService } from '../../../services/auth';

const authService = new AuthService();

export function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const history = useHistory();
    const location = useLocation();
    const { from } = location.state || { from: { pathname: "/" } };

    async function submit() {
        await authService.login({username, password});
        history.replace(from);
    }

    return (
        <div className="Login">
            <input
                value={username}
                onChange={(ev) => setUsername(ev.target.value)}
            />
            <input
                type="password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
            />
            <button onClick={() => submit()}>Login</button>
        </div>
    );
}
