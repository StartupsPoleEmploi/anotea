import React from 'react';

import PropTypes from 'prop-types';

import { loginWithAccessToken } from '../backoffice/account/service/loginService';

export default class LoginWithAccessToken extends React.Component {

    state = {
        message: 'Connexion en cours...'
    };

    static propTypes = {
        handleLoggedIn: PropTypes.func.isRequired,
        handleLogout: PropTypes.func.isRequired,
        access_token: PropTypes.string.isRequired,
        origin: PropTypes.string,
    };

    componentDidMount() {
        loginWithAccessToken(this.props.access_token, this.props.origin)
        .then(result => this.props.handleLoggedIn(result))
        .catch(() => {
            this.props.handleLogout();
        });
    }

    render() {
        return (
            <div>{this.state.message}.</div>
        );
    }
}
