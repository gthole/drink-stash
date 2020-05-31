import React from 'react';
import './index.css';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Recipes } from './components/recipes';
import { Home } from './components/home';

function App() {
    return (
        <div className="App">
            <Router>
                <header className="App-header">
                    <Link to="/" className="home-link">Drink Stash</Link>
                    <Link to="/recipes">Recipes</Link>
                </header>
                <Switch>
                    <Route path="/recipes" children={<Recipes />} />
                    <Route path="/" children={<Home />} />
                </Switch>
            </Router>
        </div>
    );
}

export default App;
