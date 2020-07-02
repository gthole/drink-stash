import React from 'react'
import { Route, Redirect } from "react-router-dom";
import { services } from 'services';

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
export function PrivateRoute({ children, ...rest }: any) {
    function render({ location }: any) {
        if (services.auth.isLoggedIn()) {
            return children;
        }
        return <Redirect to={{ pathname: '/login', state: { from: location } }} />;
    }
    return <Route { ...rest } render={ render } />;
}
