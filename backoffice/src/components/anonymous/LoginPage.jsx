import React from 'react';
import PropTypes from 'prop-types';
import Page from '../backoffice/common/page/Page';
import Panel from '../backoffice/common/page/panel/Panel';
import InputText from '../backoffice/common/page/form/InputText';
import Button from '../backoffice/common/Button';
import { CenteredForm } from '../backoffice/common/page/form/CenteredForm';
import { login, loginWithAccessToken } from './loginService';
import './LoginPage.scss';
import { NavLink } from 'react-router-dom';
import Loader from '../backoffice/common/Loader';
import GlobalMessage from '../backoffice/common/message/GlobalMessage';

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
            message: null,
        };
    }

    componentDidMount() {
        let query = this.props.navigator.getQuery();
        if (query.origin && query.access_token) {
            this.setState({ loginWithAccessToken: true }, () => {
                this.handleAccessToken(query);
            });
        }
        if (query.message) {
            this.setState({ message: query.message });
        }
    }

    componentDidUpdate(previous) {
        let query = this.props.navigator.getQuery();
        if (query.message !== previous.navigator.getQuery().message) {
            this.setState({ message: query.message });
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

        let { message } = this.state;
        let { navigator } = this.props;

        if (this.state.loginWithAccessToken) {
            return <Page
                className="LoginPage"
                title={'Connexion à votre espace Anotéa en cours...'}
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
                            <CenteredForm
                                title={<div className="a-blue">Connexion</div>}
                                elements={
                                    <>
                                        <label>Identifiant</label>
                                        <InputText
                                            value={this.state.identifiant}
                                            placeholder="Entrez votre SIRET"
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
                                        {message &&
                                        <GlobalMessage
                                            message={{ text: message }}
                                            timeout={5000}
                                            onClose={() => navigator.refreshCurrentPage()} />
                                        }
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
