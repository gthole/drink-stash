import React from 'react';
import './index.css';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { PrivateRoute } from './common/PrivateRoute';
import { RecipeList } from './components/RecipeList';
import { Home } from './components/Home';
import { Login } from './components/Login';

function App() {
    return (
        <div className="App">
            <Router>
                <header className="App-header">
                    <Link to="/" className="home-link">Drink Stash</Link>
                    <Link to="/recipes">Recipes</Link>
                </header>
                <Switch>
                	<Route path="/login" children={<Login />} />
                    <PrivateRoute path="/recipes" children={<RecipeList />} />
                    <PrivateRoute path="/" children={<Home />} />
                </Switch>
            </Router>
        </div>
    );
}

export default App;
