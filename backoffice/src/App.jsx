import React, { Component } from 'react';
import queryString from 'query-string';
import fr from 'react-intl/locale-data/fr';
import { addLocaleData, IntlProvider } from 'react-intl';
import jwtDecode from 'jwt-decode';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { removeToken, setToken } from './utils/token';
import { subscribeToHttpEvent } from './utils/http-client';
import DeprecatedHeader from './components/backoffice/common/deprecated/header/DeprecatedHeader';
import OrganisationPanel from './components/backoffice/organisation/OrganisationPanel.jsx';
import AccountActivation from './components/backoffice/organisation/AccountActivation';
import ForgottenPassword from './components/login/ForgottenPassword';
import LoginForm from './components/login/LoginForm';
import LoginWithAccessToken from './components/login/LoginWithAccessToken';
import ModerateurRoutes from './components/backoffice/moderateur/ModerateurRoutes';
import MonComptePanel from './components/backoffice/misc/account/mon-compte/MonComptePanel';
import GridDisplayer from './components/backoffice/common/GridDisplayer';
import Header from './components/backoffice/common/header/Header';
import MiscRoutes from './components/backoffice/misc/MiscRoutes';
import FinanceurRoutes from './components/backoffice/financeur/FinanceurRoutes';
import UserContext from './components/UserContext';
import './utils/moment-fr';
import './App.scss';
import ModerateurHeaderItems from './components/backoffice/moderateur/ModerateurHeaderItems';
import FinanceurHeaderItems from './components/backoffice/financeur/FinanceurHeaderItems';

addLocaleData([...fr]);

class App extends Component {

    state = {
        loggedIn: false,
        profile: null,
        action: null,
        forgottenPassword: false,
        page: 'moderation',
    };

    constructor(props) {
        super(props);
        const userId = sessionStorage.getItem('userId');
        subscribeToHttpEvent('http:error', response => {
            if (response.status === 401) {
                this.handleLogout();
            }
        });

        if (userId !== undefined && userId !== null) {
            this.state = {
                errorLogin: false,
                loggedIn: true,
                id: sessionStorage.userId,
                profile: sessionStorage.userProfile,
                codeRegion: sessionStorage.userCodeRegion,
                codeFinanceur: sessionStorage.userCodeFinanceur,
                raisonSociale: sessionStorage.userRaisonSociale,
                action: null,
                features: sessionStorage.features,
                page: 'moderation',
            };
        }
        const qs = queryString.parse(window.location.search);
        if (qs.action === 'creation') {
            this.state = {
                loggedIn: false,
                profile: 'organisme',
                action: 'creation',
                token: qs.token
            };
        } else if (qs.action === 'passwordLost') {
            this.state = {
                forgottenPassword: true,
                action: 'passwordLost',
                token: qs.token
            };
        } else if (qs.action === 'loginWithAccessToken') {
            this.state = {
                action: 'loginWithAccessToken',
                access_token: qs.access_token,
                origin: qs.origin,
            };
        }
    }

    handleLogout = () => {
        this.setState({
            loggedIn: false,
            action: null,
            profile: null,
            forgottenPassword: false
        });
        delete sessionStorage.userId;
        delete sessionStorage.userProfile;
        delete sessionStorage.userCodeRegion;
        delete sessionStorage.userCodeFinanceur;
        delete sessionStorage.userRaisonSociale;
        delete sessionStorage.features;
        removeToken();
        //Reload page to flush all react states
        window.location.href = '/admin';
    };

    handleLoggedIn = result => {

        let { profile, id, codeRegion, codeFinanceur, raisonSociale, features } = jwtDecode(result.access_token);

        sessionStorage.userId = id;
        sessionStorage.userProfile = profile;
        sessionStorage.userCodeRegion = codeRegion;
        sessionStorage.userCodeFinanceur = codeFinanceur;
        sessionStorage.userRaisonSociale = raisonSociale;
        sessionStorage.features = features;
        setToken(result.access_token);

        this.setState({
            errorLogin: false,
            loggedIn: true,
            profile,
            id,
            codeRegion: codeRegion,
            codeFinanceur: codeFinanceur,
            raisonSociale: raisonSociale,
            features: features
        });
    };

    handleError = () => {
        this.setState({ action: null, forgottenPassword: false });
        history.pushState(null, '', location.href.split('?')[0]);  // eslint-disable-line
    };

    handleForgottenPassword = () => {
        this.setState({ forgottenPassword: true, action: null });
        history.pushState(null, '', location.href.split('?')[0]);  // eslint-disable-line
    };

    showUnauthenticatedPages = () => {

        //Use deprecated design

        let showLoginForm = ((!this.state.loggedIn && this.state.action === null) && !this.state.forgottenPassword);
        let showLoginWithAccessToken = !this.state.loggedIn && this.state.action === 'loginWithAccessToken';

        return (
            <Router>
                <div className="anotea-deprecated App">
                    <DeprecatedHeader
                        handleLogout={this.handleLogout}
                        loggedIn={this.state.loggedIn}
                        profile={this.state.profile}
                        raisonSociale={this.state.raisonSociale}
                        codeFinanceur={this.state.codeFinanceur}
                        codeRegion={this.state.codeRegion} />

                    {this.state.action === 'creation' &&
                    <AccountActivation
                        handleForgottenPassword={this.handleForgottenPassword}
                        token={this.state.token}
                        onError={this.handleError} onSuccess={this.handleLogout} />}

                    {this.state.forgottenPassword &&
                    <ForgottenPassword
                        passwordLost={this.state.action === 'passwordLost'}
                        token={this.state.token}
                        onError={this.handleError}
                        onSuccess={this.handleLogout} />}

                    {showLoginWithAccessToken &&
                    <LoginWithAccessToken
                        access_token={this.state.access_token}
                        origin={this.state.origin}
                        handleLoggedIn={this.handleLoggedIn}
                        handleLogout={this.handleLogout} />}

                    {showLoginForm &&
                    <LoginForm
                        handleForgottenPassword={this.handleForgottenPassword}
                        handleLoggedIn={this.handleLoggedIn} />
                    }
                </div>
            </Router>
        );
    };

    showBackofficePages = () => {

        let { profile, codeRegion, codeFinanceur, features, id } = this.state;
        let userContext = { codeRegion, codeFinanceur };
        let backoffices = {
            moderateur: () => ({
                defaultPath: '/admin/moderateur/moderation/avis/stagiaires?page=0&status=none',
                headerItems: <ModerateurHeaderItems />,
                routes: <ModerateurRoutes />,
            }),
            financeur: () => ({
                defaultPath: '/admin/financeur/avis?status=all',
                headerItems: <FinanceurHeaderItems />,
                routes: <FinanceurRoutes />
            })
        };

        //Use new design
        if (['moderateur', 'financeur'].includes(this.state.profile)) {

            let layout = backoffices[profile]();

            return (
                <Router>
                    <UserContext.Provider value={userContext}>
                        <div className="anotea">
                            <Switch>
                                <Redirect exact from="/" to={layout.defaultPath} />
                                <Redirect exact from="/admin" to={layout.defaultPath} />
                            </Switch>

                            <Header onLogout={this.handleLogout} items={layout.headerItems} />

                            <MiscRoutes />
                            {layout.routes}
                        </div>
                    </UserContext.Provider>
                </Router>
            );
        }

        //Use deprecated design
        return (
            <Router>
                <div>
                    <div className="anotea-deprecated App">
                        <DeprecatedHeader
                            handleLogout={this.handleLogout}
                            loggedIn={this.state.loggedIn}
                            profile={profile}
                            raisonSociale={this.state.raisonSociale}
                            codeFinanceur={codeFinanceur}
                            codeRegion={codeRegion}
                            region={this.state.region} />

                        <Switch>
                            <Redirect exact from="/" to="/admin" />
                        </Switch>

                        <Route
                            path="/mon-compte"
                            render={props => (<MonComptePanel {...props} />)} />

                        <Route
                            path="/admin"
                            render={() => (
                                <div className="main">
                                    {profile === 'organisme' &&
                                    <OrganisationPanel
                                        profile={profile}
                                        id={id}
                                        codeRegion={codeRegion}
                                        features={features} />
                                    }
                                </div>)} />
                    </div>
                </div>
            </Router>
        );
    };

    render() {
        return (
            <div>
                {false && <GridDisplayer />}
                <IntlProvider locale="fr">
                    {this.state.loggedIn ? this.showBackofficePages() : this.showUnauthenticatedPages()}
                </IntlProvider>
            </div>
        );
    }
}

export default App;
