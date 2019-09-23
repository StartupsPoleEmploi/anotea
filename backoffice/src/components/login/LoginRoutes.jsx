import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';
import ReinitialisationMotDePassePage from './password/ReinitialisationMotDePassePage';
import { createNavigator } from '../../utils/route-utils';
import MotDePasseOubliePage from './password/MotDePasseOubliePage';
import LoginPage from './LoginPage';

export default class LoginRoutes extends React.Component {

    static propTypes = {
        handleLoginSucceed: PropTypes.func.isRequired,
    };

    render() {
        return (
            <>
                <Route
                    path="/admin/login"
                    render={props => {
                        let navigator = createNavigator(props);
                        return <LoginPage navigator={navigator} handleLoginSucceed={this.props.handleLoginSucceed} />;
                    }}
                />
                <Route
                    path="/admin/mot-de-passe-oublie"
                    render={props => {
                        let navigator = createNavigator(props);
                        return <MotDePasseOubliePage navigator={navigator} />;
                    }}
                />
                <Route
                    path="/admin/reinitialisation-mot-de-passe"
                    render={props => {
                        let navigator = createNavigator(props);
                        return <ReinitialisationMotDePassePage navigator={navigator} />;
                    }}
                />
            </>
        );
    }
}
