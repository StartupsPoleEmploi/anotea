import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Panel from '../common/page/panel/Panel';
import InputText from '../common/page/form/InputText';
import Button from '../common/Button';
import Page from '../common/page/Page';
import { CenteredForm } from '../common/page/form/CenteredForm';
import { isPasswordStrongEnough, isSamePassword } from '../../utils/validation';
import { activate, getActivationStatus } from './activationService';
import { login } from './loginService';
import { NavLink } from 'react-router-dom';
import AppContext from '../AppContext';

import './ActivationComptePage.scss';
import iconWarning from './Icone_warning.svg';
import iconPassword from './Icone_Password.svg';

export default class ActivationComptePage extends React.Component {

    static contextType = AppContext;

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
        let { navigator } = this.props;
        let query = navigator.getQuery();
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
                isNotSamePassword: isSamePassword(password, confirmation) ?
                    null : 'Les mots de passes ne sont pas identiques.',
            }
        }, () => {
            let isFormValid = _.every(Object.values(this.state.errors), v => !v);
            if (isFormValid) {
                let { token } = this.props.navigator.getQuery();

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
            <Page className="ActivationComptePage grey"
                panel={
                    <Panel
                        backgroundColor="grey"
                        results={
                            <CenteredForm
                                title={<div className="title">{account.nom}</div>}
                                elements={
                                    <>
                                        <hr className="grey" />
                                        <label>Votre identifiant pour la connexion</label>
                                        <div className="mb-3">
                                            <strong>{account.identifiant}</strong>
                                        </div>
                                        {account.status === 'active' ?
                                            <>
                                                <div  className="warnings">
                                                    <div>
                                                        <img src={iconWarning} />
                                                        <p>Votre espace Anotéa a déjà été créé pour cet Organisme de Formation.</p>
                                                    </div>
                                                    <div className="mt-1">
                                                        <img src={iconPassword} />
                                                        <p>
                                                            Cliquez sur&nbsp;
                                                            <NavLink to="/admin/mot-de-passe-oublie">
                                                                Mot de passe oublié
                                                            </NavLink>,&nbsp;
                                                            un email contenant un lien pour modifier votre mot de passe
                                                            vous sera transmis immédiatement.
                                                        </p>
                                                    </div>
                                                </div>
                                                <hr className="grey-5" />
                                                <div className="clarification">
                                                    Besoin d’aide ? Des questions ? Consultez notre <a href={`/services/organismes#faq`}>FAQ</a>&nbsp; 
                                                ou <a href="mailto:anotea@pole-emploi.fr">contactez-nous</a> par email.
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
                                                <hr className="grey-5" />
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
                                                color="black"
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
