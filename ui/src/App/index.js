import React, { useState } from 'react';
import './style.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { AppHeader } from './components/AppHeader';
import { PrivateRoute } from './components/PrivateRoute';
import { CommentEdit } from './pages/CommentEdit';
import { RecipeDetails } from './pages/RecipeDetails';
import { RecipeEdit } from './pages/RecipeEdit';
import { Recipes } from './pages/Recipes';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { services } from '../services';

function App() {
    const [user, setUser] = useState(services.auth.getUserData());
    function refreshUser() {
        setUser(services.auth.getUserData());
    }

    return (
        <div className="App">
            <Router>
                <AppHeader user={ user } refreshUser={ refreshUser }/>
                <Switch>
                    <Route path="/login" children={<Login refreshUser={ refreshUser } />} />
                    <PrivateRoute path="/comments/:id" children={<CommentEdit />} />
                    <PrivateRoute path="/new" children={<RecipeEdit />} />
                    <PrivateRoute path="/recipes/:slug/edit" children={<RecipeEdit />} />
                    <PrivateRoute path="/recipes/:slug" children={<RecipeDetails />} />
                    <PrivateRoute path="/recipes" children={<Recipes />} />
                    <PrivateRoute path="/" children={<Home />} />
                </Switch>
            </Router>
        </div>
    );
}

export default App;
