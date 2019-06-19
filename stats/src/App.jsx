import React, { Component } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import Header from './components/stats/Header';
import AvisStats from './components/stats/AvisStats';
import OrganismesStats from './components/stats/OrganismesStats';
import './App.css';

class App extends Component {

    render() {
        return (
            <Router>
                <div className="anotea">
                    <Header />
                    <Switch>
                        <Redirect exact from="/" to="/stats/avis" />
                        <Redirect exact from="/stats" to="/stats/avis" />
                    </Switch>
                    <Route
                        path="/stats/avis"
                        render={() => <AvisStats />}
                    />
                    <Route
                        path="/stats/organismes"
                        render={() => <OrganismesStats />}
                    />
                </div>
            </Router>
        );
    }
}

export default App;
