import React from 'react';
import './changePassword.scss';
import { checkPasswordComplexity } from '../../../../utils/password';
import { updatePassword } from '../../../../lib/accountService';

export class ChangePassword extends React.Component {

    state = {
        actualPassword: '',
        newPassword: '',
        confirmPassword: '',
        errors: {},
        ok: false,
        success: false,
        serverSideError: null
    }


    change = (item, event) => {
        this.setState({ [item]: event.target.value }, () => {
            let errors = {};
            if (this.state.newPassword.length !== 0) {
                if (this.state.newPassword.length < 6) {
                    errors = Object.assign(errors, { tooShort: true });
                } else if (!checkPasswordComplexity(this.state.newPassword)) {
                    errors = Object.assign(errors, { tooSimple: true });
                }
            }
            if (this.state.confirmPassword.length !== 0 && this.state.newPassword !== this.state.confirmPassword) {
                errors = Object.assign(errors, { notEquals: true });
            }
            this.setState({ errors: errors });
        });
    }

    update = () => {
        updatePassword(this.state.actualPassword, this.state.newPassword, sessionStorage.userId, sessionStorage.userProfile).then(result => {
            if (result.error === undefined) {
                this.setState({ success: true });
            } else {
                this.setState({
                    serverSideError: result.error,
                    actualPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            }
            setTimeout(() => {
                this.setState({ success: false, serverSideError: null });
            }, 5000);
        });
    }

    passwordIsOk = () => {
        return this.state.newPassword === this.state.confirmPassword && checkPasswordComplexity(this.state.newPassword);
    }

    render() {

        return (
            <div className="changePassword">
                <h3 className="subtitle"><span className="fas fa-key" /> Changer le mot de passe</h3>
                <small>Nous vous conseillons d’utiliser un mot de passe sûr que vous n’utilisez nulle part ailleurs</small>
                {this.state.success && <div className="alert alert-success" role="alert">
                    Mot de passe mis &agrave; jour avec succ&egrave;s.
                </div>
                }

                <div className="form-group">
                    <label>Mot de passe actuel</label>
                    <input type="password" className="form-control" value={this.state.actualPassword} onChange={this.change.bind(this, 'actualPassword')} placeholder="Mot de passe" />
                    {this.state.serverSideError && this.state.serverSideError.type === 'PASSWORD_INVALID' && <small className="form-text error">
                        { this.state.serverSideError.message }
                    </small>}
                </div>

                <div className="form-group">
                    <label>Nouveau mot de passe</label>
                    <input type="password" className="form-control" value={this.state.newPassword} onChange={this.change.bind(this, 'newPassword')} placeholder="Mot de passe" />
                    {this.state.errors.tooShort && <small className="form-text error">Trop court</small>}
                    {(this.state.errors.tooSimple || this.state.serverSideError && this.state.serverSideError.type === 'PASSWORD_NOT_STRONG') && <small className="form-text error">Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre</small>}
                </div>

                <div className="form-group">
                    <label>Confirmer nouveau mot de passe</label>
                    <input type="password" className="form-control" value={this.state.confirmPassword} onChange={this.change.bind(this, 'confirmPassword')} placeholder="Mot de passe" />
                    {this.state.errors.notEquals && <small className="form-text error">Les mots de passe ne sont pas identiques</small>}
                    {!this.state.errors.notEquals && this.state.confirmPassword.length !== 0 && <small className="form-text ok">Mots de passe sont identiques</small>}
                </div>

                <button className="btn btn-primary" onClick={this.update} disabled={!this.passwordIsOk()} >Mettre à jour</button>

            </div>
        );
    }
}