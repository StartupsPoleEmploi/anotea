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
        trainee: null,
        infosRegion: null
    }

    showRemerciements = infosRegion => {
        this.setState({ infosRegion, toRemerciements: true });
    }

    setTrainee = trainee => this.setState({ trainee });

    render() {
        return (
            <Router>
                <div>
                    {this.state.toRemerciements === true &&
                        <Redirect to={`/${this.state.trainee.token}/remerciements`} />
                    }

                    <Switch>
                        <Route path="/:token" exact render={props => (<Questionnaire token={props.match.params.token} setTrainee={this.setTrainee} showRemerciements={this.showRemerciements} />)} />
                        <Route path="/:token/remerciements" exact render={() => (<Remerciements trainee={this.state.trainee} infosRegion={this.state.infosRegion} />)} />
                        <Route component={NoMatch} />
                    </Switch>
                </div>
            </Router>
        );
    }
}

export default App;
