import React from 'react'
import { Route, Redirect } from "react-router-dom";
import { services } from 'services';

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
export function PrivateRoute({ component, ...rest }: any) {
    function render(props) {
        if (services.auth.isLoggedIn()) {
            return React.createElement(component, props)
        }
        return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />;
    }
    return <Route { ...rest } render={ render } />;
}
