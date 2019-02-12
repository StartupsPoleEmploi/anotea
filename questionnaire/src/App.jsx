import React, { Component } from 'react';

import Questionnaire from './components/Questionnaire';
import Remerciements from './components/Remerciements';
import NoMatch from './components/NoMatch';

import {
    BrowserRouter as Router,
    Route,
    Switch,
    Redirect
} from 'react-router-dom';

import './App.scss';

class App extends Component {

    state = {
        token: null,
        infosRegion: null
    }

    showRemerciements = infosRegion => {
        this.setState({ infosRegion, toRemerciements: true });
    }

    setToken = token => this.setState({ token });

    render() {

        if (this.state.toRemerciements === true) {
            return (
                <Router>
                    <Redirect to={`/${this.state.token}/remerciements`} />
                </Router>
            );
        }

        return (
            <Router>
                <Switch>
                    <Route path="/:token" exact render={props => (<Questionnaire token={props.match.params.token} setToken={this.setToken} showRemerciements={this.showRemerciements} />)} />
                    <Route path="/:token/remerciements" exact render={state => (<Remerciements {...state} />)} />
                    <Route component={NoMatch} />
                </Switch>


            </Router>
        );
    }
}

export default App;
