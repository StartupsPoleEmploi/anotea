import React, { Component } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch,
    Redirect
} from 'react-router-dom';

import Remerciements from './components/Remerciements';
import Questionnaire from './components/Questionnaire';
import NoMatch from './components/NoMatch';
import Footer from './components/common/Footer';
import './App.scss';

class App extends Component {

    state = {
        stagiaire: null,
        infosRegion: null
    };

    showRemerciements = infosRegion => {
        this.setState({ infosRegion, toRemerciements: true });
    };

    setStagiaire = stagiaire => this.setState({ stagiaire });

    render() {
        return (
            <Router>
                <div>
                    {this.state.toRemerciements === true &&
                    <Redirect to={`${process.env.PUBLIC_URL}/${this.state.stagiaire.token}/remerciements`} />
                    }

                    <Switch>
                        <Route path={`${process.env.PUBLIC_URL}/:token`} exact render={props => {
                            return (
                                <Questionnaire
                                    token={props.match.params.token}
                                    setStagiaire={this.setStagiaire}
                                    showRemerciements={this.showRemerciements} />);
                        }} />
                        <Route path={`${process.env.PUBLIC_URL}/:token/remerciements`} exact render={() => {
                            if (!this.state.stagiaire) {
                                //FIXME fix how stagiaire is fetched
                                return <div />;
                            }
                            return (
                                <Remerciements
                                    stagiaire={this.state.stagiaire}
                                    infosRegion={this.state.infosRegion} />);
                        }} />
                        <Route component={NoMatch} />
                    </Switch>

                    <Footer codeRegion={this.state.stagiaire ? this.state.stagiaire.codeRegion : null} />
                </div>
            </Router>
        );
    }
}

export default App;
