import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Panel from '../backoffice/common/page/panel/Panel';
import InputText from '../backoffice/common/page/form/InputText';
import Button from '../backoffice/common/Button';
import Page from '../backoffice/common/page/Page';
import { AuthForm } from './AuthForm';
import { checkConfirm, isPasswordStrongEnough } from '../../utils/validation';
import { activateAccount, getOrganismeByToken } from '../backoffice/organisation/service/organismeService';
import { login } from '../login/loginService';
import { NavLink } from 'react-router-dom';

export default class ActivationComptePage extends React.Component {

    static propTypes = {
        navigator: PropTypes.object.isRequired,
        onLogin: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            password: '',
            confirmation: '',
            errors: {
                isNotSamePassword: false,
                passwordNotStrongEnough: false,
            },
            organisme: {
                raisonSociale: '',
                siret: '',
                activated: false,
            },
        };
    }

    componentDidMount() {
        let { navigator } = this.props;
        let query = navigator.getQuery();

        getOrganismeByToken(query.token)
        .then(organisme => this.setState({ organisme, loading: false }))
        .catch(() => navigator.goToPage('/admin/login', { message: 'Une erreur est survenue' }));
    }

    formIsValid = () => {
        return _.every(Object.values(this.state.errors), v => v === false);
    };

    onSubmit = () => {
        this.setState({ loading: true });

        let { password, confirmation, organisme } = this.state;
        this.setState({
            errors: {
                isNotSamePassword: !checkConfirm(password, confirmation),
                passwordNotStrongEnough: !isPasswordStrongEnough(password),
            }
        }, async () => {
            if (this.formIsValid()) {
                let { token } = this.props.navigator.getQuery();
                await activateAccount(password, token);
                let data = await login(organisme.siret, password);
                this.props.onLogin(data);
            }
        });
    };

    render() {

        let { organisme, errors } = this.state;

        return (
            <Page
                title={'Accéder à mon espace Anotéa'}
                panel={
                    <Panel
                        backgroundColor="blue"
                        results={
                            <AuthForm
                                title={organisme.raisonSociale}
                                elements={
                                    <>
                                        <label>Votre identifiant pour la connexion</label>
                                        <div className="mb-3">
                                            {organisme.siret}
                                        </div>
                                        {organisme.activated ?
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
                                                    className={errors.passwordNotStrongEnough ? 'input-error' : ''}
                                                    value={this.state.password}
                                                    placeholder="Mot de passe"
                                                    onChange={event => this.setState({ password: event.target.value })}
                                                />
                                                {errors.passwordNotStrongEnough &&
                                                <span className="input-error-details">
                                                    Le mot de passe doit contenir au moins 6 caractères
                                                    dont une majuscule et un caractère spécial.
                                                </span>
                                                }

                                                <label className="mt-3">Confirmer le mot de passe</label>
                                                <InputText
                                                    type="password"
                                                    className={errors.isNotSamePassword ? 'input-error' : ''}
                                                    value={this.state.confirmation}
                                                    placeholder="Mot de passe"
                                                    onChange={event => this.setState({ confirmation: event.target.value })}
                                                />
                                                {errors.isNotSamePassword &&
                                                <span className="input-error-details"> Les mots de passes ne sont pas identiques.</span>
                                                }
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
                                    organisme.activated ? <div /> :
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
