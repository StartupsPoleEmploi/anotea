import React from 'react';
import Page from '../common/page/Page';
import Panel from '../common/page/panel/Panel';
import { CenteredForm } from '../common/page/form/CenteredForm';
import InputText from '../common/page/form/InputText';
import Button from '../common/Button';
import { isPasswordStrongEnough, isSamePassword } from '../../utils/validation';
import _ from 'lodash';
import { updatePassword } from '../../services/meService';
import AppContext from '../AppContext';

export default class MonComptePage extends React.Component {

    static contextType = AppContext;

    constructor(props) {
        super(props);
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
                    null : 'Le mot de passe doit contenir au moins 6 caractères dont une majuscule et un caractère spécial.',
                isNotSamePassword: isSamePassword(password, confirmation) ?
                    null : 'Les mots de passes ne sont pas identiques.',
            }
        }, async () => {
            let isFormValid = _.every(Object.values(this.state.errors), v => !v);
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
                    let json = await error.json;

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

        return <Page
            panel={
                <Panel
                    backgroundColor="grey"
                    results={
                        <CenteredForm
                            title="Mise à jour du mot de passe"
                            elements={
                                <>
                                    <label>Mot de passe actuel</label>
                                    <InputText
                                        type="password"
                                        value={this.state.current}
                                        placeholder="Mot de passe"
                                        onChange={event => this.setState({ current: event.target.value })}
                                    />

                                    <label className="mt-3">Nouveau mot de passe</label>
                                    <InputText
                                        type="password"
                                        value={this.state.password}
                                        placeholder="Mot de passe"
                                        error={errors.passwordNotStrongEnough}
                                        onChange={event => this.setState({ password: event.target.value })}
                                    />

                                    <label className="mt-3">Confirmer le nouveau mot de passe</label>
                                    <InputText
                                        type="password"
                                        value={this.state.confirmation}
                                        placeholder="Mot de passe"
                                        error={errors.isNotSamePassword}
                                        onChange={event => this.setState({ confirmation: event.target.value })}
                                    />
                                </>
                            }
                            buttons={
                                <>
                                    <Button
                                        type="submit"
                                        size="large"
                                        disabled={this.state.loading}
                                        onClick={() => this.onSubmit()}
                                    >
                                        Confirmer
                                    </Button>
                                </>
                            }
                        />
                    }
                />
            }
        />;
    }
}
