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
import BackofficeContext from '../../BackofficeContext';

export default class ReinitialisationMotDePassePage extends React.Component {

    static contextType = BackofficeContext;

    static propTypes = {
        router: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.inputRef = React.createRef();
        this.state = {
            loading: false,
            password: '',
            confirmation: '',
            errors: {
                passwordNotStrongEnough: null,
                isNotSamePassword: null,
                emptyField: null, // Ajout du champ pour gérer les champs vides
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
                    null : 'Le mot de passe doit contenir au moins 8 caractères dont au moins une minuscule, une majuscule, un chiffre et un caractère spécial.',
                isNotSamePassword: password === confirmation ?
                    null : 'Les mots de passes ne sont pas identiques.',
                emptyField: (password === '' || confirmation === '') ? 'Veuillez remplir tous les champs.' : null,
            }
        }, async () => {
            let isFormValid = _.every(Object.values(this.state.errors), v => !v);
            if (this.inputRef.current && this.inputRef.current.focus) {
                this.inputRef.current.focus();
            }
            if (isFormValid) {
                let { forgottenPasswordToken } = this.props.router.getQuery();

                this.setState({ loading: true });
                resetPassword(password, forgottenPasswordToken)
                .then(() => {
                    showMessage({
                        text: 'Votre mot de passe a été modifié avec succès',
                        color: 'green',
                    });

                    return this.props.router.goToPage('/backoffice/login');
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
            <>
            <title>Réinitialiser le mot de passe | Anotéa</title>
            <Page
                backgroundColor="grey"
                title={'Votre espace Anotéa'}
                panel={
                    <Panel
                        results={
                            <CenteredForm
                                title="Créer un nouveau mot de passe"
                                elements={
                                    <>
                                        <label for="newMotDePasse" className="mt-3">Nouveau mot de passe</label>
                                        <InputText
                                            id="newMotDePasse"
                                            type="password"
                                            value={this.state.password}
                                            placeholder="Mot de passe"
                                            error={errors.emptyField || errors.passwordNotStrongEnough}
                                            onChange={event => this.setState({ password: event.target.value })}
                                            autoComplete="new-password"
                                            aria-invalid="true"
                                            inputRef={this.inputRef}
                                            aria-required="true"
                                        />

                                        <label for="confMotDePasse" className="mt-3">Confirmer le nouveau mot de passe</label>
                                        <InputText
                                            id="confMotDePasse"
                                            type="password"
                                            value={this.state.confirmation}
                                            placeholder="Mot de passe"
                                            error={errors.emptyField || errors.isNotSamePassword}
                                            onChange={event => this.setState({ confirmation: event.target.value })}
                                            autoComplete="new-password"
                                            aria-invalid="true"
                                            aria-required="true"
                                        />
                                    </>
                                }
                                buttons={
                                    <>
                                        <Button
                                            type="submit"
                                            size="large"
                                            color="orange"
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
            </>
        );
    }
}
