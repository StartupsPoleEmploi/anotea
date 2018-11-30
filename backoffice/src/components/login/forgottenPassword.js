import React from 'react';

import PropTypes from 'prop-types';

import { askNewPassword, updatePassword, checkIfPasswordTokenExists } from '../../lib/forgottenPasswordService';
import { isPasswordStrongEnough, checkConfirm, passwordIsOK } from '../../utils/validation';

export class ForgottenPassword extends React.Component {

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
        this.setState({ username: evt.target.value });
    };

    handleAsk = () => {
        askNewPassword(this.state.username).then(() => this.setState({ error: false, asked: true }))
        .catch(e => {
            console.log(e);
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

    onSuccess = evt => {
        this.onSuccessCallback(this.state.userInfo);
    };

    render() {
        return (
            <div className="forgottenPassword">
                <h1>Espace Anotea</h1>
                {!this.state.asked && !this.state.passwordLost &&
                <div className="content row">
                    <div className="block col-md-4">
                        <h4>Récupération du mot de passe</h4>
                        {this.state.error &&
                        <div className="alert alert-danger">Cette adresse email est inconnue.</div>}

                        <input type="text"
                            id="username"
                            value={this.state.username}
                            className="form-control input-sm"
                            placeholder="Numéro de SIRET"
                            onChange={this.handleUsernameChange}
                            onKeyPress={this.handleKeyPress} />

                        <div className="wrapper">
                            <span className="group-btn">
                                <button onClick={this.handleAsk} className="btn btn-primary btn-md">
                                    Envoyer <span className="fas fa-location"></span>
                                </button>
                            </span>
                        </div>
                    </div>
                    <div className="info col-md-8">
                        <h3>Informations complémentaires</h3>
                        <p>Vous allez pouvoir recréer un mot de passe qui vous permettra d'accéder à votre espace
                            Anotéa.</p>

                        <p>Il vous suffit simplement de saisir le numéro de SIRET de votre organisme et de cliquer sur
                            le bouton «Envoyer».</p>
                        <p>Vous recevrez très rapidement un e-mail qui vous permettra de créer un nouveau mot de passe
                            afin d'accéder à votre espace en toute sécurité.</p>
                        <p>L'adresse e-mail est celle sur laquelle vous avez reçu la proposition de création de compte
                            Anotéa</p>
                    </div>
                </div>}
                {this.state.asked &&
                <div className="asked">
                    <h3>Un e-mail vient de vous être envoyé</h3>

                    <p>Votre demande nous a bien été transmise et un e-mail vient de vous être envoyé à l'adresse que
                        vous nous avez indiquée.</p>

                    <p>Il vous suffit maintenant de cliquer sur le lien figurant dans le courrier pour créer votre
                        nouveau mot de passe.</p>
                </div>
                }
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
            </div>
        );
    }
}
