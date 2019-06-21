import React, { Component } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import Header from './components/stats/Header';
import StatsRoutes from './components/stats/StatsRoutes';
import GridDisplayer from './components/common/library/GridDisplayer';
import './App.scss';

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
                    <div className="container">
                        <Route
                            path="/stats"
                            render={() => <StatsRoutes />}
                        />
                    </div>
                    {false && <GridDisplayer />}
                </div>
            </Router>
        );
    }
}

export default App;
