import React, { Component } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import Header from './components/stats/Header';
import AvisStatsTable from './components/stats/AvisStatsTable';
import OrganismesStatsTable from './components/stats/OrganismesStatsTable';
import GridDisplayer from './components/common/GridDisplayer';
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
                            path="/stats/avis"
                            render={() => <AvisStatsTable />}
                        />
                        <Route
                            path="/stats/organismes"
                            render={() => <OrganismesStatsTable />}
                        />
                    </div>
                    {false && <GridDisplayer />}
                </div>
            </Router>
        );
    }
}

export default App;
