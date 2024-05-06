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
        this.inputRef = React.createRef();
        this.passwordInputRef = React.createRef();
        this.state = {
            loginWithAccessToken: false,
            loading: false,
            errors: false,
            errorMessage: '',
            identifiant: '',
            password: '',
            emptyField: '',
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
    
        if (this.state.password === '' && this.state.identifiant === '') {
            this.setState({ errorMessage: "Les champs de l'identifiant et du mot de passe sont vides", emptyField: 'both', loading: false });
            if (this.inputRef.current && this.inputRef.current.focus) {
                this.inputRef.current.focus();
            }
        } else if (this.state.password === '') {
            this.setState({ errorMessage: "Le champ du mot de passe est vide", emptyField: 'password', loading: false });
            if (this.passwordInputRef.current && this.passwordInputRef.current.focus) {
                this.passwordInputRef.current.focus();
            }
        } else if (this.state.identifiant === '') {
            this.setState({ errorMessage: "Le champ de l'identifiant est vide", emptyField: 'identifiant', loading: false });
            if (this.inputRef.current && this.inputRef.current.focus) {
                this.inputRef.current.focus();
            }
        } else {
            login(this.state.identifiant, this.state.password)
                .then(data => this.props.onLogin(data))
                .catch(() => {
                    const errorMessage = 'Votre identifiant et/ou votre mot de passe sont incorrects. ' +
                        'Si vous êtes un organisme, vous devez désormais vous identifier avec votre numéro de SIRET';
                    this.setState({ errorMessage: errorMessage, emptyField: 'incorrect' , loading: false });
                    if (this.inputRef.current && this.inputRef.current.focus) {
                        this.inputRef.current.focus();
                    }
                });
        }
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
            <>
            <title>Connexion | Anotéa</title>
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
                                        <p className="clarification mt-1">Tous les champs sont obligatoires.</p>
                                        <label for="identifiant">Identifiant</label>
                                        <InputText
                                            id="identifiant"
                                            value={this.state.identifiant}
                                            placeholder="Entrez votre SIRET"
                                            onChange={event => this.setState({ identifiant: event.target.value })}
                                            error={
                                                (this.state.emptyField === 'identifiant' || this.state.emptyField === 'both' || this.state.emptyField === 'incorrect') ?
                                                this.state.errorMessage : ''
                                            }
                                            autoComplete="username"
                                            className="placeholder-opaque"
                                            inputRef={this.inputRef}
                                            aria-describedby="exemple-siret"
                                            aria-invalid="true"
                                            aria-required="true"
                                        />
                                        <p id="exemple-siret" className="clarification mt-1">Le numero de SIRET se compose de 14 chiffres.<br/>Exemple&nbsp;:&nbsp;01234567890123</p>

                                        <label for="motDePasse" className="mt-3">Mot de passe</label>
                                        <InputText
                                            id="motDePasse"
                                            type="password"
                                            value={this.state.password}
                                            placeholder="Entrez votre mot de passe "
                                            onChange={event => this.setState({ password: event.target.value })}
                                            error={
                                                (this.state.emptyField === 'password') ?
                                                this.state.errorMessage : ''
                                            }
                                            autoComplete="current-password"
                                            className="placeholder-opaque"
                                            aria-invalid="true"
                                            inputRef={this.passwordInputRef}
                                            aria-required="true"
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
            </>
        );
    }
}
