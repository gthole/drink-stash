import React, { useState, useEffect } from 'react';
import './style.css';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Alerts } from 'components/Alerts';
import { AppHeader } from 'components/AppHeader';
import { PrivateRoute } from 'components/PrivateRoute';
import { AppContext } from 'context/AppContext';
import { CommentEdit } from 'pages/CommentEdit';
import { ListDetails } from 'pages/ListDetails';
import { ListEdit } from 'pages/ListEdit';
import { Lists } from 'pages/Lists';
import { RecipeDetails } from 'pages/RecipeDetails';
import { RecipeEdit } from 'pages/RecipeEdit';
import { RecipeRandom } from 'pages/RecipeRandom';
import { Recipes } from 'pages/Recipes';
import { Home } from 'pages/Home';
import { Login } from 'pages/Login';
import { UserEdit } from 'pages/UserEdit';
import { UserCabinet } from 'pages/UserCabinet';
import { UserDetails } from 'pages/UserDetails';
import { services } from 'services';

function App() {
    const [user, setUser] = useState(services.auth.getUserData());
    const [alerts, setAlerts] = useState([]);
    const context = {
        currentUser: user,
        refreshUser: () => { setUser({...services.auth.getUserData()}) },
        addAlert: (type, message) => {
            if (alerts.find(a => a.message === message)) return;
            alerts.push({type, message, ts: Date.now()});
            setAlerts([...alerts]);
        }
    };

    // Pre-cache some data
    useEffect(() => {
        if (!user) return;
        Promise.all([
            services.ingredients.getPage(),
            services.tags.getPage(),
            services.uom.getPage(),
        ]);
    }, [user]);

    const routes = (
        <Switch>
            <Route path="/login" component={Login} />
            <PrivateRoute path="/comments/:id" component={CommentEdit} />
            <PrivateRoute path="/discover" component={RecipeRandom} />
            <PrivateRoute path="/users/:listUsername/lists/:id/edit" component={ListEdit} />
            <PrivateRoute path="/users/:listUsername/lists/new" component={ListEdit} />
            <PrivateRoute path="/users/:listUsername/lists/:id" component={ListDetails} />
            <PrivateRoute path="/users/:listUsername/lists" component={Lists} />
            <PrivateRoute path="/users/:username/cabinet/:selectedParam" component={UserCabinet} />
            <PrivateRoute path="/users/:username/cabinet" component={UserCabinet} />
            <PrivateRoute path="/users/:username/edit" component={UserEdit} />
            <PrivateRoute path="/users/:username" component={UserDetails} />
            <PrivateRoute path="/new" component={RecipeEdit} />
            <PrivateRoute path="/recipes/:slug/edit" component={RecipeEdit} />
            <PrivateRoute path="/recipes/:slug" component={RecipeDetails} />
            <PrivateRoute path="/recipes" component={Recipes} />
            <PrivateRoute path="/" component={Home} />
        </Switch>
    );

    return (
        <div className="App">
            <AppContext.Provider value={context}>
                <Router>
                    <AppHeader />
                    <Alerts alerts={ alerts } setAlerts={ setAlerts }/>
                    <div className="AppContent">
                        { routes }
                    </div>
                </Router>
            </AppContext.Provider>
        </div>
    );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// TODO eventually: Re-introduce service worker
