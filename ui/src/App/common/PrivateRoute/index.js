import React from 'react'
import { Route, Redirect } from "react-router-dom";
import { AuthService } from '../../../services/auth';

const authService = new AuthService();

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
export function PrivateRoute({ children, ...rest }: any) {
    function render({ location }: any) {
        if (authService.isLoggedIn()) {
            return children;
        }
        return <Redirect to={{ pathname: '/login', state: { from: location } }} />;
    }
    return <Route { ...rest } render={ render } />;
}
