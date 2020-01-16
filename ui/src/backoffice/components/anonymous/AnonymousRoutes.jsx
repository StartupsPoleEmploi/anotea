import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';
import ReinitialisationMotDePassePage from './ReinitialisationMotDePassePage';
import MotDePasseOubliePage from './MotDePasseOubliePage';
import LoginPage from './LoginPage';
import ActivationComptePage from './ActivationComptePage';
import LibraryPage from './LibraryPage';
import StatsPage from '../stats/StatsPage';

export default class AnonymousRoutes extends React.Component {

    static propTypes = {
        router: PropTypes.object.isRequired,
        onLogin: PropTypes.func.isRequired,
    };

    render() {
        let { router } = this.props;

        return (
            <>
                <Route
                    path="/admin/login"
                    render={() => <LoginPage router={router} onLogin={this.props.onLogin} />}
                />
                <Route
                    path="/admin/mot-de-passe-oublie"
                    render={() => <MotDePasseOubliePage router={router} />}
                />
                <Route
                    path="/admin/reinitialisation-mot-de-passe"
                    render={() => <ReinitialisationMotDePassePage router={router} />}
                />
                <Route
                    path="/admin/activation-compte"
                    render={() => <ActivationComptePage router={router} onLogin={this.props.onLogin} />}
                />
                <Route path="/admin/library" render={() => <LibraryPage />} />
            </>
        );
    }
}
