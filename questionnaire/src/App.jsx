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
        stagiaire: null,
        infosRegion: null
    }

    showRemerciements = infosRegion => {
        this.setState({ infosRegion, toRemerciements: true });
    }

    setStagiaire = stagiaire => this.setState({ stagiaire });

    render() {
        return (
            <Router>
                <div>
                    {this.state.toRemerciements === true &&
                        <Redirect to={`${process.env.PUBLIC_URL}/${this.state.stagiaire.token}/remerciements`} />
                    }

                    <Switch>
                        <Route path={`${process.env.PUBLIC_URL}/:token`} exact render={props => (<Questionnaire token={props.match.params.token} setStagiaire={this.setStagiaire} showRemerciements={this.showRemerciements} />)} />
                        <Route path={`${process.env.PUBLIC_URL}/:token/remerciements`} exact render={() => (<Remerciements stagiaire={this.state.stagiaire} infosRegion={this.state.infosRegion} />)} />
                        <Route component={NoMatch} />
                    </Switch>
                </div>
            </Router>
        );
    }
}

export default App;
