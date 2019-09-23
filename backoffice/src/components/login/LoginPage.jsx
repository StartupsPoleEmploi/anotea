import React from 'react';
import PropTypes from 'prop-types';
import Page from '../backoffice/common/page/Page';
import Panel from '../backoffice/common/page/panel/Panel';
import InputText from '../backoffice/common/page/form/InputText';
import Button from '../backoffice/common/Button';
import { AuthForm } from './AuthForm';
import { login, loginWithAccessToken } from './loginService';
import './LoginPage.scss';
import { NavLink } from 'react-router-dom';
import Loader from '../backoffice/common/Loader';

export default class LoginPage extends React.Component {

    static propTypes = {
        navigator: PropTypes.object.isRequired,
        handleLoginSucceed: PropTypes.func.isRequired,
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

    onSubmit = () => {
        this.setState({ loading: true });

        login(this.state.identifiant, this.state.password)
        .then(data => this.props.handleLoginSucceed(data))
        .catch(() => this.setState({ error: true, loading: false }));
    };

    handleAccessToken = data => {
        loginWithAccessToken(data.access_token, data.origin)
        .then(result => this.props.handleLoginSucceed(result))
        .catch(e => {
            console.log(e);
            return this.setState({ loginWithAccessToken: false });
        });
    };

    componentDidMount() {
        let query = this.props.navigator.getQuery();
        if (query.origin && query.access_token) {
            this.setState({ loginWithAccessToken: true }, () => {
                this.handleAccessToken(query);
            });
        }
    }

    render() {

        if (this.state.loginWithAccessToken) {
            return <Page
                className="LoginPage"
                title={'Connexion en cours à votre espace Anotéa...'}
                panel={<Loader centered={true} />}
            />;
        }

        return (
            <Page
                className="LoginPage"
                title={'Votre espace Anotéa'}
                panel={
                    <Panel
                        backgroundColor="blue"
                        results={
                            <AuthForm
                                title="Connexion"
                                elements={
                                    <>
                                        <label>Identifiant</label>
                                        <InputText
                                            className={this.state.error ? 'input-error' : ''}
                                            value={this.state.identifiant}
                                            placeholder="Entrez votre SIRET"
                                            onChange={event => this.setState({ identifiant: event.target.value })}
                                        />
                                        {this.state.error &&
                                        <span className="input-error-details">Votre identifiant est incorrect.</span>
                                        }

                                        <label className="mt-3">Mot de passe</label>
                                        <InputText
                                            type="password"
                                            className={this.state.error ? 'input-error' : ''}
                                            value={this.state.password}
                                            placeholder="Entrez votre mot de passe "
                                            onChange={event => this.setState({ password: event.target.value })}
                                        />
                                        {this.state.error &&
                                        <span className="input-error-details">Votre mot de passe est erroné.</span>
                                        }
                                    </>
                                }
                                buttons={
                                    <div className="d-flex flex-column">
                                        <div className="mot-de-passe-oublie">
                                            <NavLink to="/admin/mot-de-passe-oublie">
                                                Mot de passe oublié
                                            </NavLink>
                                        </div>
                                        <Button
                                            type="submit"
                                            size="large"
                                            color="blue"
                                            disabled={this.state.loading}
                                            onClick={this.onSubmit}
                                        >
                                            Confirmer
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
