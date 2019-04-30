import React from 'react';
import PropTypes from 'prop-types';

import {
    askNewPassword,
    updatePassword,
    checkIfPasswordTokenExists
} from '../backoffice/account/service/forgottenPasswordService';
import { isPasswordStrongEnough, checkConfirm, passwordIsOK } from '../../utils/validation';

export default class ForgottenPassword extends React.Component {

    state = {
        error: false,
        asked: false
    };

    static propTypes = {
        onSuccess: PropTypes.func.isRequired,
        onError: PropTypes.func.isRequired,
        passwordLost: PropTypes.bool.isRequired,
        token: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);
        this.onSuccessCallback = props.onSuccess;
        this.state = Object.assign(this.state, { passwordLost: props.passwordLost, token: props.token });
        if (props.passwordLost) {
            checkIfPasswordTokenExists(props.token).then(result => {
                if (result.error) {
                    props.onError();
                }
            });
        }
    }

    handleUsernameChange = evt => {
        this.setState({ error: false });
        this.setState({ username: evt.target.value });
    };

    handleAsk = () => {
        askNewPassword(this.state.username).then(() => this.setState({ error: false, asked: true }))
        .catch(() => {
            this.setState({ error: true });
        });
    };

    handlePasswordChange = evt => {
        this.setState({ password: evt.target.value });
    };

    handlePasswordConfirmChange = evt => {
        this.setState({ passwordConfirm: evt.target.value });
    };

    handePasswordChange = () => {
        updatePassword(this.state.token, this.state.password).then(result => {
            if (!result.error) {
                this.setState({ passwordChanged: true, userInfo: result.userInfo });
                history.pushState(null, "", location.href.split("?")[0])  // eslint-disable-line
            }
        });
    };

    onSuccess = () => {
        this.onSuccessCallback(this.state.userInfo);
    };

    render() {
        let inputClassName = 'form-control input-sm';
        if (!this.state.asked && !this.state.passwordLost && this.state.error) {
            inputClassName = 'error';
        }

        return (
            <div className="forgottenPassword">
                {this.state.asked &&
                    <div className="asked">
                        L&apos;email à bien été envoyé.
                    </div>
                }
                <h1>Votre espace Anotéa</h1>
                {!this.state.asked && !this.state.passwordLost &&
                    <div className="block">
                        <h4>Mot de passe oublié</h4>

                        <div className="identifiant">
                            <h1>Entrez votre identifiant et confirmez l&apos;envoi</h1>
                            <input type="text"
                                id="username"
                                value={this.state.username}
                                className={inputClassName}
                                placeholder="Adresse mail ou SIRET"
                                onChange={this.handleUsernameChange}
                                onKeyPress={this.handleKeyPress} />
                        </div>

                        <p className="clarification">L&apos;adresse e-mail est celle sur laquelle vous avez reçu la
                            proposition de création de compte Anotéa, si vous ne la connaissez pas.</p>

                        <div className="wrapper">
                            <span className="group-btn">
                                <button onClick={this.handleAsk} className="btn btn-primary btn-md">
                                    Confirmer
                                </button>
                            </span>
                        </div>
                    </div>
                }

                {!this.state.asked && !this.state.passwordLost && this.state.error &&
                        <div className="alert-danger identifiant-incorrect">Désolé mais cet identifiant est incorrect.</div>}
                
                {this.state.passwordLost && !this.state.userInfo &&
                <div className="block passwordLost">
                    <h4>Nous vous invitons à créer un nouveau mot de passe</h4>

                    <form>
                        <div className="form-group">
                            <label>Choisissez un nouveau mot de passe pour votre compte Anotea</label>
                            <input type="password"
                                className={'form-control ' + (isPasswordStrongEnough(this.state.password) ? 'is-valid' : 'is-invalid')}
                                onChange={this.handlePasswordChange} value={this.state.password}
                                placeholder="Mot de passe" />
                            {!isPasswordStrongEnough(this.state.password) &&
                            <div className="invalid-feedback">
                                Le mot de passe doit contenir au moins 6 caractères dont une majuscule et un caractère
                                spécial.
                            </div>
                            }
                        </div>
                        <div className="form-group">
                            <label>Confirmez votre mot de passe</label>
                            <input type="password"
                                className={'form-control ' + (checkConfirm(this.state.password, this.state.passwordConfirm) ? 'is-valid' : 'is-invalid')}
                                onChange={this.handlePasswordConfirmChange} value={this.state.passwordConfirm}
                                placeholder="Mot de passe" />
                            {!checkConfirm(this.state.password, this.state.passwordConfirm) &&
                            <div className="invalid-feedback">
                                Les mots de passes ne sont pas identiques.
                            </div>
                            }
                        </div>
                        <a role="button" className="btn btn-primary"
                            disabled={!passwordIsOK(this.state.password, this.state.passwordConfirm)}
                            onClick={this.handePasswordChange}>Modifier</a>
                    </form>
                </div>
                }
                {this.state.passwordLost && this.state.userInfo &&
                <div className="passwordChanged">
                    Votre mot de passe a été changé avec succès. Vous pouvez maintenant accéder à <a
                        onClick={this.onSuccess} role="button">votre espace Anotea</a>.
                </div>}
                <br/>
            </div>
        );
    }
}
