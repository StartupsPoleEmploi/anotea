import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route, Switch } from 'react-router-dom';
import ReinitialisationMotDePassePage from './ReinitialisationMotDePassePage';
import MotDePasseOubliePage from './MotDePasseOubliePage';
import LoginPage from './LoginPage';
import ActivationComptePage from './ActivationComptePage';
import LibraryPage from './LibraryPage';
import StatsPage from './StatsPage';

export default class AnonymousRoutes extends React.Component {

    static propTypes = {
        router: PropTypes.object.isRequired,
        onLogin: PropTypes.func.isRequired,
    };

    render() {
        let { router } = this.props;

        return (
            <Switch>
                <Route path="/backoffice/login" render={() => {
                    return <LoginPage router={router} onLogin={this.props.onLogin} />;
                }} />
                <Route path="/backoffice/mot-de-passe-oublie" render={() => {
                    return <MotDePasseOubliePage router={router} />;
                }} />
                <Route path="/backoffice/reinitialisation-mot-de-passe" render={() => {
                    return <ReinitialisationMotDePassePage router={router} />;
                }} />
                <Route path="/backoffice/activation-compte" render={() => {
                    return <ActivationComptePage router={router} onLogin={this.props.onLogin} />;
                }} />
                <Route path="/backoffice/library" render={() => {
                    return <LibraryPage />;
                }} />
                <Route path="/backoffice/stats" render={() => {
                    return <StatsPage router={router} />;
                }} />
                <Redirect to="/backoffice/login" />
            </Switch>
        );
    }
}
