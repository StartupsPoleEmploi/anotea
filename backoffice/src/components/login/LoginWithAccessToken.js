import React from 'react';

import { loginWithAccessToken } from '../../lib/loginService';

export class LoginWithAccessToken extends React.Component {

    state = {
        message: 'Connexion en cours..'
    };

    componentDidMount() {
        loginWithAccessToken(this.props.access_token)
        .then(result => this.props.handleLoggedIn(result))
        .catch(err => {
            this.props.handleLogout();
        });
    }

    render() {
        return (
            <div>{this.state.message}.</div>
        );
    }
}
