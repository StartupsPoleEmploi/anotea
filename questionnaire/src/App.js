import React, { Component } from 'react';

import Questionnaire from './components/Questionnaire';
import NoMatch from './components/NoMatch';

import {
    BrowserRouter as Router,
    Route,
    Switch
} from 'react-router-dom';

import './App.scss';

class App extends Component {

    render() {
        return (
            <Router>
                <Switch>
                    <Route path="/:token" exact component={Questionnaire} />
                    <Route component={NoMatch} />
                </Switch>
            </Router>
        );
    }
}

export default App;
