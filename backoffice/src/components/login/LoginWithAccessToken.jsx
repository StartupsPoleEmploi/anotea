import React from 'react';

import PropTypes from 'prop-types';

import { loginWithAccessToken } from '../../lib/loginService';

export default class LoginWithAccessToken extends React.Component {

    state = {
        message: 'Connexion en cours...'
    };

    static propTypes = {
        handleLoggedIn: PropTypes.func.isRequired,
        handleLogout: PropTypes.func.isRequired,
        access_token: PropTypes.string.isRequired
    }

    componentDidMount() {
        loginWithAccessToken(this.props.access_token)
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
