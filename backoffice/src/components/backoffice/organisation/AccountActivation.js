import React from 'react';

import { getActivationAccountStatus, activateAccount } from './service/organismeService';
import { isPasswordStrongEnough, checkConfirm, passwordIsOK } from '../../../utils/validation';

export default class AccountActivation extends React.Component {

    state = {
        accountStatus: {
            raisonSociale: '',
            siret: '',
        },
        password: null,
        passwordConfirm: null,
        token: null,
        alreadyCreated: null
    }

    constructor(props) {
        super(props);
        this.onSuccessCallback = props.onSuccess;
        this.handleForgottenPassword = props.handleForgottenPassword;
        getActivationAccountStatus(props.token).then(result => {
            if (result.error) {
                if (result.error === 'Already created') {
                    this.setState({ alreadyCreated: true });
                } else {
                    props.onError();
                }
            } else {
                this.setState({ alreadyCreated: false });
            }
            this.setState({ token: props.token, accountStatus: result });
        });
    }

    handlePasswordChange = evt => {
        this.setState({ password: evt.target.value });
    }

    handlePasswordConfirmChange = evt => {
        this.setState({ passwordConfirm: evt.target.value });
    }

    handleActivation = evt => {
        activateAccount(this.state.token, this.state.password).then(result => {
            if (!result.error) {
                this.setState({ accountCreated: true, userInfo: result.userInfo });
                history.pushState(null, "", location.href.split("?")[0])  // eslint-disable-line
            }
        });
    }

    onSuccess = evt => {
        this.onSuccessCallback(this.state.userInfo);
    }

    render() {
        return (
            <div className="AccountCreation">

                {(this.state.alreadyCreated === false) &&
                <div>
                    <h2>Création de compte pour l'organisme de formation {this.state.accountStatus.raisonSociale}</h2>

                    {!this.state.accountCreated &&
                    <div>

                        <form>
                            <div className="form-group">
                                <label>Votre identifiant pour la connexion</label>
                                <input type="text" className="form-control" value={this.state.accountStatus.siret}
                                       readOnly="readonly" />
                            </div>
                            <div className="form-group">
                                <label className="instructions">Choisissez un mot de passe pour créer votre compte
                                    Anotea</label>
                                <input type="password"
                                       className={'form-control ' + (isPasswordStrongEnough(this.state.password) ? 'is-valid' : 'is-invalid')}
                                       onChange={this.handlePasswordChange} value={this.state.password}
                                       placeholder="Mot de passe" />
                                {!isPasswordStrongEnough(this.state.password) &&
                                <div className="invalid-feedback">
                                    Le mot de passe doit contenir au moins 6 caractères dont une majuscule et un
                                    caractère spécial.
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
                               onClick={this.handleActivation}>Créez votre compte</a>
                        </form>

                        <p className="info">
                            Vous souhaitez en savoir plus sur le service Anotéa : consultez <a
                            href="http://anotea.pole-emploi.fr" target="blank">http://anotea.pole-emploi.fr</a> et sa <a
                            href="http://anotea.pole-emploi.fr/faq" target="blank">Foire aux Questions</a>.
                        </p>
                    </div>}

                    {this.state.accountCreated &&
                    <div>
                        Votre compte a été créé avec succès. Vous pouvez maintenant accéder à <a
                        onClick={this.onSuccess} role="button">votre espace Anotea</a>.
                    </div>}
                </div>
                }
                {this.state.alreadyCreated === true &&
                <div>
                    <h1>Création Espace Organisme de formation</h1>

                    <p>Bonjour,</p>

                    <p>Un Espace Anotéa a déjà été créé pour cet Organisme de Formation.</p>

                    <p>Cliquez sur <a onClick={this.handleForgottenPassword} role="button">Mot de passe oublié</a> : un
                        e-mail contenant un lien pour modifier votre mot de passe vous sera transmis immédiatement.</p>
                </div>
                }
            </div>
        );
    }
}
