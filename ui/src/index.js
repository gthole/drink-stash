import React, { useState, useEffect } from 'react';
import './style.css';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { AppHeader } from 'components/AppHeader';
import { PrivateRoute } from 'components/PrivateRoute';
import { AppContext } from 'context/AppContext';
import { CommentEdit } from 'pages/CommentEdit';
import { ListDetails } from 'pages/ListDetails';
import { RecipeDetails } from 'pages/RecipeDetails';
import { RecipeEdit } from 'pages/RecipeEdit';
import { Recipes } from 'pages/Recipes';
import { Home } from 'pages/Home';
import { Login } from 'pages/Login';
import { services } from 'services';

function App() {
    const [user, setUser] = useState(services.auth.getUserData());
    const [alerts, setAlerts] = useState([]);
    const context = {
        currentUser: user,
        refreshUser: () => { setUser(services.auth.getUserData()) },
        addAlert: (a) => {
            alerts.push(a);
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
            <Route path="/login" children={<Login />} />
            <PrivateRoute path="/comments/:id" children={<CommentEdit />} />
            <PrivateRoute path="/users/:listUsername/lists/:id" children={<ListDetails />} />
            <PrivateRoute path="/new" children={<RecipeEdit />} />
            <PrivateRoute path="/recipes/:slug/edit" children={<RecipeEdit />} />
            <PrivateRoute path="/recipes/:slug" children={<RecipeDetails />} />
            <PrivateRoute path="/recipes" children={<Recipes />} />
            <PrivateRoute path="/" children={<Home />} />
        </Switch>
    );

    return (
        <div className="App">
            <AppContext.Provider value={context}>
                <Router>
                    <AppHeader />
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

// TODO: Re-introduce service worker
