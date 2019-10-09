import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Panel from '../common/page/panel/Panel';
import InputText from '../common/page/form/InputText';
import Button from '../common/Button';
import Page from '../common/page/Page';
import { CenteredForm } from '../common/page/form/CenteredForm';
import { checkIfPasswordTokenExists, resetPassword } from './passwordService';
import { isPasswordStrongEnough, isSamePassword } from '../../utils/validation';
import GlobalMessage from '../common/message/GlobalMessage';

export default class ReinitialisationMotDePassePage extends React.Component {

    static propTypes = {
        navigator: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            message: null,
            password: '',
            confirmation: '',
            errors: {
                passwordNotStrongEnough: null,
                isNotSamePassword: null,
            },
        };
    }

    componentDidMount() {
        let { navigator } = this.props;
        let { forgottenPasswordToken } = navigator.getQuery();

        checkIfPasswordTokenExists(forgottenPasswordToken)
        .catch(this.showErrorMessage);
    }

    onSubmit = () => {

        let { password, confirmation } = this.state;
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
                let { forgottenPasswordToken } = this.props.navigator.getQuery();
                this.setState({ loading: true });

                resetPassword(password, forgottenPasswordToken)
                .then(() => this.props.navigator.goToPage('/admin/login', { message: 'Votre mot de passe a été modifié avec succès' }))
                .catch(() => this.setState({ loading: false, message: 'Une erreur est survenue' }));
            }
        });
    };

    render() {
        let { errors, message } = this.state;

        return (
            <Page
                title={'Votre espace Anotéa'}
                panel={
                    <Panel
                        backgroundColor="blue"
                        results={
                            <CenteredForm
                                title={<div className="a-blue">Créer un nouveau mot de passe</div>}
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
                                    <>
                                        <Button
                                            type="submit"
                                            size="large"
                                            color="blue"
                                            disabled={this.state.loading}
                                            onClick={() => this.onSubmit()}
                                        >
                                            Confirmer
                                        </Button>
                                        {message &&
                                        <GlobalMessage
                                            message={{ text: message, color: 'red', timeout: 5000 }}
                                            onClose={() => this.setState({ message: null })} />
                                        }
                                    </>
                                }
                            />
                        }
                    />
                }
            />
        );
    }
}