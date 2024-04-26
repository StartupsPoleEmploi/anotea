import React from 'react';
import Page from './page/Page';
import Panel from './page/panel/Panel';
import { CenteredForm } from './page/form/CenteredForm';
import InputText from './page/form/InputText';
import Button from '../../../common/components/Button';
import { isPasswordStrongEnough } from '../../utils/password-utils';
import _ from 'lodash';
import { updatePassword } from '../../services/meService';
import BackofficeContext from '../../BackofficeContext';

export default class MonComptePage extends React.Component {

    static contextType = BackofficeContext;

    constructor(props) {
        super(props);
        this.inputRef = React.createRef();
        this.state = {
            loading: false,
            current: '',
            password: '',
            confirmation: '',
            errors: {
                passwordNotStrongEnough: null,
                isNotSamePassword: null,
            },
        };
    }

    onSubmit = () => {

        let { current, password, confirmation } = this.state;
        let { showMessage } = this.context;

        this.setState({
            errors: {
                passwordNotStrongEnough: isPasswordStrongEnough(password) ?
                    null : 'Le mot de passe doit contenir au moins 8 caractères dont au moins une minuscule, une majuscule, un chiffre et un caractère spécial.',
                isNotSamePassword: password === confirmation ?
                    null : 'Les mots de passes ne sont pas identiques.',
            }
        }, async () => {
            let isFormValid = _.every(Object.values(this.state.errors), v => !v);
            if (this.inputRef.current && this.inputRef.current.focus) {
                this.inputRef.current.focus();
            }
            if (isFormValid) {
                this.setState({ loading: true });

                updatePassword(current, password)
                .then(() => {
                    showMessage({
                        text: 'Votre mot de passe a été modifié',
                        color: 'green',
                        timeout: 5000,
                    });

                    return this.setState({
                        loading: false,
                        current: '',
                        password: '',
                        confirmation: '',
                    });
                })
                .catch(async error => {
                    let json = await error.json();

                    showMessage({
                        text: json.message,
                        color: 'red',
                    });

                    this.setState({
                        loading: false,
                    });
                });
            }
        });
    };

    render() {
        let { errors } = this.state;
        let { theme } = this.context;

        return <Page
            panel={
                <Panel
                    results={
                        <div>
                            <h1 className="sr-only">Statistique nationale et régionale</h1>
                            <CenteredForm
                                title="Mise à jour du mot de passe"
                                elements={
                                    <>
                                        <label for="motDePasseActu">Mot de passe actuel</label>
                                        <InputText
                                            id="motDePasseActu"
                                            type="password"
                                            value={this.state.current}
                                            placeholder="Mot de passe"
                                            onChange={event => this.setState({ current: event.target.value })}
                                            autoComplete="current-password"
                                            inputRef={this.inputRef}
                                        />

                                        <label for="motDePasseNew" className="mt-3">Nouveau mot de passe</label>
                                        <InputText
                                            id="motDePasseNew"
                                            type="password"
                                            value={this.state.password}
                                            placeholder="Mot de passe"
                                            error={errors.passwordNotStrongEnough}
                                            onChange={event => this.setState({ password: event.target.value })}
                                            autoComplete="new-password"
                                        />

                                        <label for="motDePasseConf" className="mt-3">Confirmer le nouveau mot de passe</label>
                                        <InputText
                                            id="motDePasseConf"
                                            type="password"
                                            value={this.state.confirmation}
                                            placeholder="Mot de passe"
                                            error={errors.isNotSamePassword}
                                            onChange={event => this.setState({ confirmation: event.target.value })}
                                            autoComplete="new-password"
                                        />
                                    </>
                                }
                                buttons={
                                    <>
                                        <Button
                                            type="submit"
                                            size="large"
                                            color={theme.buttonColor}
                                            disabled={this.state.loading}
                                            onClick={() => this.onSubmit()}
                                        >
                                            Confirmer
                                        </Button>
                                    </>
                                }
                            />
                        </div>
                    }
                />
            }
        />;
    }
}
