import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';
import ReinitialisationMotDePassePage from './ReinitialisationMotDePassePage';
import MotDePasseOubliePage from './MotDePasseOubliePage';
import LoginPage from './LoginPage';
import ActivationComptePage from './ActivationComptePage';
import LibraryPage from './LibraryPage';

export default class AnonymousRoutes extends React.Component {

    static propTypes = {
        navigator: PropTypes.object.isRequired,
        onLogin: PropTypes.func.isRequired,
    };

    render() {
        let { navigator } = this.props;

        return (
            <>
                <Route
                    path="/admin/login"
                    render={() => <LoginPage navigator={navigator} onLogin={this.props.onLogin} />}
                />
                <Route
                    path="/admin/mot-de-passe-oublie"
                    render={() => <MotDePasseOubliePage navigator={navigator} />}
                />
                <Route
                    path="/admin/reinitialisation-mot-de-passe"
                    render={() => <ReinitialisationMotDePassePage navigator={navigator} />}
                />
                <Route
                    path="/admin/activation-compte"
                    render={() => <ActivationComptePage navigator={navigator} onLogin={this.props.onLogin} />}
                />
                <Route exact path="/admin/library" render={() => <LibraryPage />} />
            </>
        );
    }
}
