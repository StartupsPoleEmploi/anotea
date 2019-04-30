import React from 'react';
import PropTypes from 'prop-types';

import { login } from '../backoffice/account/service/loginService';

export default class LoginForm extends React.Component {

    state = {}

    static propTypes = {
        handleLoggedIn: PropTypes.func.isRequired,
        handleForgottenPassword: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        this.state = {
            badPassword: false,
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
        this.setState({ errorLogin: false });
        this.setState({ username: evt.target.value });
    }

    handleLoginPasswordChange = evt => {
        this.setState({ badPassword: false });
        this.setState({ password: evt.target.value });
    }

    handleLogin = () => {
        const credentials = { username: this.state.username, password: this.state.password };
        login(credentials)
        .then(result => {
            this.setState({ errorLogin: false, loggedIn: true });
            this.handleLoggedIn(result);
        })
        .catch(e => {
            if (e.message === 'Invalid token specified') {
                this.setState({ errorLogin: true });
            } else {
                this.setState({ badPassword: true });
            }
        });
    }

    render() {
        let inputIdentifiantClassName = 'form-control input-sm';
        if (this.state.errorLogin) {
            inputIdentifiantClassName = 'error';
        }

        let inputPasswordClassName = 'form-control input-sm';
        if (this.state.badPassword) {
            inputPasswordClassName = 'password-error';
        }

        return (
            <div className="loginForm">
                <h1>Votre espace Anotéa</h1>
                <div className="block">
                    <h4>Connexion</h4>

                    <div className="identifiant">
                        <h1>Identifiant</h1>
                        <input type="text"
                            id="username"
                            value={this.state.username}
                            className={inputIdentifiantClassName}
                            placeholder="Entrez votre SIRET"
                            onChange={this.handleLoginUsernameChange}
                            onKeyPress={this.handleKeyPress} />
                    </div>
                    {this.state.errorLogin &&
                        <p className="bad-credential">Votre identifiant est incorrect.</p>
                    }

                    <div className="mot-de-passe">
                        <h1>Mot de passe</h1>
                        <input type="password"
                            id="password"
                            value={this.state.password}
                            className={inputPasswordClassName}
                            placeholder="Entrez votre mot de passe"
                            onChange={this.handleLoginPasswordChange}
                            onKeyPress={this.handleKeyPress} />
                    </div>
                    {this.state.badPassword &&
                        <p className="bad-credential">Votre mot de passe est erroné.</p>
                    }

                    <div className="loginHelp">
                        <button type="button" className="btn btn-link" onClick={this.handleForgottenPassword}>Mot de passe
                            oublié
                        </button>
                    </div>

                    <div className="wrapper">
                        <span className="group-btn">
                            <button onClick={this.handleLogin} className="btn btn-primary btn-md">
                                Confirmer
                            </button>
                        </span>
                    </div>
                </div>
                <br/>
            </div>
        );
    }
}
