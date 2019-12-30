import React, { Component } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import Header from './components/Header';
import StatsRoutes from './components/StatsRoutes';
import GridDisplayer from '../common/components/GridDisplayer';
import './Stats.scss';

class Stats extends Component {

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
                        <div className="info">Données cumulées depuis la date de déploiement.</div>
                    </div>
                    {false && <GridDisplayer />}
                </div>
            </Router>
        );
    }
}

export default Stats;
