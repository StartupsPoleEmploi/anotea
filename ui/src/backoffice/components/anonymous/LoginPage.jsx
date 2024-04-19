import React from 'react';
import PropTypes from 'prop-types';
import Page from '../common/page/Page';
import Panel from '../common/page/panel/Panel';
import InputText from '../common/page/form/InputText';
import Button from '../../../common/components/Button';
import { CenteredForm } from '../common/page/form/CenteredForm';
import { login, loginWithAccessToken } from '../../services/loginService';
import './LoginPage.scss';
import { NavLink } from 'react-router-dom';
import Loader from '../../../common/components/Loader';

export default class LoginPage extends React.Component {

    static propTypes = {
        router: PropTypes.object.isRequired,
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
        let query = this.props.router.getQuery();
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

        let errorMessage = 'Votre identifiant et/ou votre mot de passe sont incorrects. ' +
            'Si vous êtes un organisme, vous devez désormais vous identifier avec votre numéro de SIRET';

        return (
            <Page
                className="LoginPage"
                title={'Votre espace Anotéa'}
                panel={
                    <Panel
                        backgroundColor="grey"
                        results={
                            <CenteredForm
                                title="Connexion"
                                elements={
                                    <>
                                        <label>Identifiant</label>
                                        <InputText
                                            value={this.state.identifiant}
                                            placeholder="Entrez votre SIRET"
                                            onChange={event => this.setState({ identifiant: event.target.value })}
                                            error={this.state.error ? errorMessage : ''}
                                            autoComplete="username"
                                            className="placeholder-opaque"
                                        />

                                        <label className="mt-3">Mot de passe</label>
                                        <InputText
                                            type="password"
                                            value={this.state.password}
                                            placeholder="Entrez votre mot de passe "
                                            onChange={event => this.setState({ password: event.target.value })}
                                            error={this.state.error ? ' ' : ''}
                                            autoComplete="current-password"
                                            className="placeholder-opaque"
                                        />
                                    </>
                                }
                                buttons={
                                    <div className="d-flex flex-column">
                                        <div className="mot-de-passe-oublie">
                                            <NavLink to="/backoffice/mot-de-passe-oublie" style={{ color: "#0175E4" }} >
                                                Mot de passe oublié
                                            </NavLink>
                                        </div>
                                        <Button
                                            type="submit"
                                            size="large"
                                            color="orange"
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
