import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Panel from '../common/page/panel/Panel';
import InputText from '../common/page/form/InputText';
import Button from '../../../common/components/Button';
import Page from '../common/page/Page';
import { CenteredForm } from '../common/page/form/CenteredForm';
import { isPasswordStrongEnough } from '../../utils/password-utils';
import { activate, getActivationStatus } from '../../services/activationService';
import { login } from '../../services/loginService';
import { NavLink } from 'react-router-dom';
import AppContext from '../../BackofficeContext';

export default class ActivationComptePage extends React.Component {

    static contextType = AppContext;

    static propTypes = {
        router: PropTypes.object.isRequired,
        onLogin: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            password: '',
            confirmation: '',
            errors: {
                passwordNotStrongEnough: null,
                isNotSamePassword: null,
            },
            account: {
                nom: '',
                identifiant: '',
                active: false,
            },
        };
    }

    componentDidMount() {
        let { router } = this.props;
        let query = router.getQuery();
        let { showMessage } = this.context;


        getActivationStatus(query.token)
        .then(account => this.setState({ account, loading: false }))
        .catch(() => {
            showMessage({
                timeout: 5000,
                text: 'Le lien utilisé ne semble pas valide.',
                color: 'red',
            });
        });
    }

    onSubmit = () => {
        let { password, confirmation, account } = this.state;
        let { showMessage } = this.context;

        this.setState({
            errors: {
                passwordNotStrongEnough: isPasswordStrongEnough(password) ?
                    null : 'Le mot de passe doit contenir au moins 6 caractères dont une majuscule et un caractère spécial.',
                isNotSamePassword: password === confirmation ?
                    null : 'Les mots de passes ne sont pas identiques.',
            }
        }, () => {
            let isFormValid = _.every(Object.values(this.state.errors), v => !v);
            if (isFormValid) {
                let { token } = this.props.router.getQuery();

                this.setState({ loading: true });
                activate(token, password)
                .then(async () => {
                    let data = await login(account.identifiant, password);
                    this.props.onLogin(data);
                })
                .catch(() => {
                    this.setState({ loading: false });
                    showMessage({
                        text: 'Une erreur est survenue lors de l\'activation du compte.',
                        color: 'red',
                    });
                });
            }
        });
    };

    render() {

        let { account, errors } = this.state;

        return (
            <Page
                title={'Accéder à mon espace Anotéa'}
                panel={
                    <Panel
                        backgroundColor="blue"
                        results={
                            <CenteredForm
                                title={<div className="a-blue">{account.nom}</div>}
                                elements={
                                    <>
                                        <label>Votre identifiant pour la connexion</label>
                                        <div className="mb-3">
                                            {account.identifiant}
                                        </div>
                                        {account.status === 'active' ?
                                            <>
                                                <div className="clarification">
                                                    <div>Un Espace Anotéa a déjà été créé pour cet Organisme de Formation.</div>
                                                    <div className="mt-1">
                                                        Cliquez sur
                                                        <NavLink to="/admin/mot-de-passe-oublie">
                                                            Mot de passe oublié,
                                                        </NavLink>
                                                        un email contenant un lien pour modifier votre mot de passe
                                                        vous sera transmis immédiatement.
                                                    </div>
                                                </div>
                                            </> :
                                            <>
                                                <label>Choisissez un mot de passe</label>
                                                <InputText
                                                    type="password"
                                                    placeholder="Mot de passe"
                                                    value={this.state.password}
                                                    error={errors.passwordNotStrongEnough}
                                                    onChange={event => this.setState({ password: event.target.value })}
                                                />

                                                <label className="mt-3">Confirmer le mot de passe</label>
                                                <InputText
                                                    type="password"
                                                    placeholder="Mot de passe"
                                                    value={this.state.confirmation}
                                                    error={errors.isNotSamePassword}
                                                    onChange={event => this.setState({ confirmation: event.target.value })}
                                                />
                                                <p className="clarification mt-3">
                                                    Vous souhaitez en savoir plus sur le service Anotéa : consultez
                                                    <a href="http://anotea.pole-emploi.fr" target="blank">
                                                        http://anotea.pole-emploi.fr
                                                    </a> et sa
                                                    <a href="http://anotea.pole-emploi.fr/faq" target="blank">
                                                        Foire aux Questions
                                                    </a>.
                                                </p>
                                            </>
                                        }
                                    </>
                                }
                                buttons={
                                    account.status === 'active' ? <div /> :
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
