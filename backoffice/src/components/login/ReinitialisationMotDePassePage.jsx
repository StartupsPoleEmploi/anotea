import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Panel from '../backoffice/common/page/panel/Panel';
import InputText from '../backoffice/common/page/form/InputText';
import Button from '../backoffice/common/Button';
import Page from '../backoffice/common/page/Page';
import { AuthForm } from './AuthForm';
import { checkIfPasswordTokenExists, updatePassword } from './passwordService';
import { isSamePassword, isPasswordStrongEnough } from '../../utils/validation';

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
                isNotSamePassword: null,
                passwordNotStrongEnough: null,
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
                isNotSamePassword: isSamePassword(password, confirmation) ?
                    null : 'Le mot de passe doit contenir au moins 6 caractères dont une majuscule et un caractère spécial.',
                passwordNotStrongEnough: isPasswordStrongEnough(password) ?
                    null : 'Les mots de passes ne sont pas identiques.',
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
        let { errors } = this.state;

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
