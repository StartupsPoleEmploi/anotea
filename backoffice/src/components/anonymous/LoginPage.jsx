import React from 'react';
import PropTypes from 'prop-types';
import Page from '../common/page/Page';
import Panel from '../common/page/panel/Panel';
import InputText from '../common/page/form/InputText';
import Button from '../common/Button';
import { CenteredForm } from '../common/page/form/CenteredForm';
import { login, loginWithAccessToken } from './loginService';
import './LoginPage.scss';
import { NavLink } from 'react-router-dom';
import Loader from '../common/Loader';

export default class LoginPage extends React.Component {

    static propTypes = {
        navigator: PropTypes.object.isRequired,
        onLogin: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            loginWithAccessToken: false,
            loading: false,
            errors: false,
            identifiant: '',
            password: '',
        };
    }

    componentDidMount() {
        let query = this.props.navigator.getQuery();
        if (query.origin && query.access_token) {
            this.setState({ loginWithAccessToken: true }, () => {
                this.handleAccessToken(query);
            });
        }
    }

    onSubmit = () => {
        this.setState({ loading: true });

        login(this.state.identifiant, this.state.password)
        .then(data => this.props.onLogin(data))
        .catch(() => this.setState({ error: true, loading: false }));
    };

    handleAccessToken = data => {
        loginWithAccessToken(data.access_token, data.origin)
        .then(result => this.props.onLogin(result))
        .catch(e => {
            console.log(e);
            return this.setState({ loginWithAccessToken: false });
        });
    };

    render() {

        if (this.state.loginWithAccessToken) {
            return <Page
                className="LoginPage"
                title={'Connexion à votre espace Anotéa en cours...'}
                panel={<Loader centered={true} />}
            />;
        }

        return (
            <Page
                className="LoginPage grey"
                panel={
                    <Panel
                        backgroundColor="grey"
                        results={
                            <CenteredForm
                                title={<div className="title">Accès à mon espace Anotéa</div>}
                                className="mb-2"
                                elements={
                                    <>
                                        <hr className="grey" />
                                        <label>Votre identifiant pour la connexion</label>
                                        <InputText
                                            value={this.state.identifiant}
                                            placeholder="Identifiant Anotéa"
                                            onChange={event => this.setState({ identifiant: event.target.value })}
                                            error={this.state.error ? 'Votre identifiant est incorrect.' : ''}
                                        />

                                        <label className="mt-3">Mot de passe</label>
                                        <InputText
                                            type="password"
                                            value={this.state.password}
                                            placeholder="Entrez votre mot de passe "
                                            onChange={event => this.setState({ password: event.target.value })}
                                            error={this.state.error ? 'Votre mot de passe est erroné.' : ''}
                                        />
                                    </>
                                }
                                buttons={
                                    <div className="d-flex flex-column clarification">
                                        <div className="mot-de-passe-oublie">
                                            <NavLink to="/admin/mot-de-passe-oublie">
                                                Mot de passe oublié
                                            </NavLink>
                                        </div>
                                        <hr className="grey-5" />
                                        <div className="help">
                                            Besoin d’aide ? Des questions ? Consultez notre <a href={`/services/${this.props.profile === 'financeur' ? 'financeur' : 'organisme'}s/fonctionnement#faq`}>FAQ</a>&nbsp; 
                                            ou <a href="mailto:anotea@pole-emploi.fr">contactez-nous</a> par email.
                                        </div>
                                        <Button
                                            type="submit"
                                            size="large"
                                            color="black"
                                            disabled={this.state.loading}
                                            onClick={this.onSubmit}
                                            className="login"
                                        >
                                            Se connecter
                                        </Button>
                                    </div>
                                }
                            />
                        }
                    />
                }
            />
        );
    }
}
