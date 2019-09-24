import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Panel from '../backoffice/common/page/panel/Panel';
import InputText from '../backoffice/common/page/form/InputText';
import Button from '../backoffice/common/Button';
import Page from '../backoffice/common/page/Page';
import { AuthForm } from './AuthForm';
import { checkIfPasswordTokenExists, updatePassword } from './passwordService';
import { checkConfirm, isPasswordStrongEnough } from '../../utils/validation';

export default class ReinitialisationMotDePassePage extends React.Component {

    static propTypes = {
        navigator: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            password: '',
            confirmation: '',
            errors: {
                isNotSamePassword: false,
                passwordNotStrongEnough: false,
            },
        };
    }

    componentDidMount() {
        let { navigator } = this.props;
        let { token } = navigator.getQuery();

        checkIfPasswordTokenExists(token)
        .catch(() => navigator.goToPage('/admin/login', { message: 'Une erreur est survenue' }));
    }

    hasFormErrors = () => {
        return _.some(Object.values(this.state.errors), v => v === true);
    };

    onSubmit = () => {
        this.setState({ loading: true });

        let { password, confirmation } = this.state;
        this.setState({
            errors: {
                isNotSamePassword: !checkConfirm(password, confirmation),
                passwordNotStrongEnough: !isPasswordStrongEnough(password),
                loading: false,
            }
        }, async () => {
            if (!this.hasFormErrors()) {
                let { token } = this.props.navigator.getQuery();
                await updatePassword(password, token);
                this.props.navigator.goToPage('/admin');
            }
        });
    };

    render() {

        return (
            <Page
                title={'Votre espace Anotéa'}
                panel={
                    <Panel
                        backgroundColor="blue"
                        results={
                            <AuthForm
                                title=" Créer un nouveau mot de passe"
                                elements={
                                    <>
                                        <label>Nouveau mot de passe</label>
                                        <InputText
                                            type="password"
                                            className={this.state.errors.passwordNotStrongEnough ? 'input-error' : ''}
                                            value={this.state.password}
                                            placeholder="Mot de passe"
                                            onChange={event => this.setState({ password: event.target.value })}
                                        />
                                        {this.state.errors.passwordNotStrongEnough &&
                                        <span className="input-error-details">
                                            Le mot de passe doit contenir au moins 6 caractères
                                            dont une majuscule et un caractère spécial.
                                        </span>
                                        }

                                        <label className="mt-3">Confirmer le nouveau mot de passe</label>
                                        <InputText
                                            type="password"
                                            className={this.state.errors.isNotSamePassword ? 'input-error' : ''}
                                            value={this.state.confirmation}
                                            placeholder="Mot de passe"
                                            onChange={event => this.setState({ confirmation: event.target.value })}
                                        />
                                        {this.state.errors.isNotSamePassword &&
                                        <span className="input-error-details"> Les mots de passes ne sont pas identiques.</span>
                                        }
                                    </>
                                }
                                buttons={
                                    <Button
                                        type="submit"
                                        size="large"
                                        color="blue"
                                        disabled={this.state.loading}
                                        onClick={() => this.onSubmit()}
                                    >
                                        Confirmer
                                    </Button>
                                }
                            />
                        }
                    />
                }
            />
        );
    }
}
