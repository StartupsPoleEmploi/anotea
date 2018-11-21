import React from 'react';

import PropTypes from 'prop-types';

import { login } from '../../lib/loginService';

export class LoginForm extends React.Component {

    state = {}

    static propTypes = {
        handleLoggedIn: PropTypes.func.isRequired,
        handleForgottenPassword: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        this.state = {
            errorLogin: false,
            username: '',
            password: ''
        };
        this.handleLoggedIn = props.handleLoggedIn;
        this.handleForgottenPassword = props.handleForgottenPassword;
    }

    handleKeyPress = evt => {
        if (evt.key === 'Enter') {
            this.handleLogin();
        }
    }

    handleLoginUsernameChange = evt => {
        this.setState({ username: evt.target.value });
    }

    handleLoginPasswordChange = evt => {
        this.setState({ password: evt.target.value });
    }

    handleLogin = () => {
        const credentials = { username: this.state.username, password: this.state.password };
        login(credentials)
        .then(result => {
            this.setState({ errorLogin: false, loggedIn: true });
            this.handleLoggedIn(result);
        })
        .catch(() => {
            this.setState({ errorLogin: true });
        });
    }

    render() {
        return (
            <div className="loginForm">
                <h1>Espace Anotea</h1>
                <div className="block">
                    <h4>Connexion</h4>
                    {this.state.errorLogin &&
                    <div className="alert alert-danger">Vos identifiants ne sont pas reconnus, merci de
                        recommencer.</div>}

                    <input type="text"
                        id="username"
                        value={this.state.username}
                        className="form-control input-sm"
                        placeholder="Numéro de SIRET"
                        onChange={this.handleLoginUsernameChange}
                        onKeyPress={this.handleKeyPress} />

                    <input type="password"
                        id="password"
                        value={this.state.password}
                        className="form-control input-sm"
                        placeholder="votre mot de passe"
                        onChange={this.handleLoginPasswordChange}
                        onKeyPress={this.handleKeyPress} />

                    <div className="wrapper">
                        <span className="group-btn">
                            <button onClick={this.handleLogin} className="btn btn-primary btn-md">Se connecter <span className="oi oi-account-login"></span></button>
                        </span>
                    </div>
                </div>
                <div className="loginHelp">
                    <button type="button" className="btn btn-link" onClick={this.handleForgottenPassword}>Mot de passe oublié?</button>
                </div>
            </div>
        );
    }
}
