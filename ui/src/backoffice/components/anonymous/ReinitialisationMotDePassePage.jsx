import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Panel from '../common/page/panel/Panel';
import InputText from '../common/page/form/InputText';
import Button from '../../../common/components/Button';
import Page from '../common/page/Page';
import { CenteredForm } from '../common/page/form/CenteredForm';
import { checkIfPasswordTokenExists, resetPassword } from '../../services/passwordService';
import { isPasswordStrongEnough } from '../../utils/password-utils';
import AppContext from '../../BackofficeContext';

export default class ReinitialisationMotDePassePage extends React.Component {

    static contextType = AppContext;

    static propTypes = {
        router: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            password: '',
            confirmation: '',
            errors: {
                passwordNotStrongEnough: null,
                isNotSamePassword: null,
            },
        };
    }


    componentDidMount() {
        let { router } = this.props;
        let { forgottenPasswordToken } = router.getQuery();
        let { showMessage } = this.context;

        this.setState({ loading: true });
        checkIfPasswordTokenExists(forgottenPasswordToken)
        .then(() => this.setState({ loading: false }))
        .catch(() => {
            showMessage({
                timeout: 5000,
                text: 'Le lien utilisé ne semble plus valide.',
                color: 'red',
            });
        });
    }

    onSubmit = () => {
        let { password, confirmation } = this.state;
        let { showMessage } = this.context;

        this.setState({
            errors: {
                passwordNotStrongEnough: isPasswordStrongEnough(password) ?
                    null : 'Le mot de passe doit contenir au moins 6 caractères dont une majuscule et un caractère spécial.',
                isNotSamePassword: password === confirmation ?
                    null : 'Les mots de passes ne sont pas identiques.',
            }
        }, async () => {
            let isFormValid = _.every(Object.values(this.state.errors), v => !v);
            if (isFormValid) {
                let { forgottenPasswordToken } = this.props.router.getQuery();

                this.setState({ loading: true });
                resetPassword(password, forgottenPasswordToken)
                .then(() => {
                    showMessage({
                        text: 'Votre mot de passe a été modifié avec succès',
                        color: 'green',
                    });

                    return this.props.router.goToPage('/admin/login');
                })
                .catch(() => {
                    this.setState({ loading: false });
                    showMessage({
                        text: 'Une erreur est survenue lors de la réinitialisation du mot de passe.',
                        color: 'red',
                    });
                });
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
