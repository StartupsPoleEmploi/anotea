import React, { Component } from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import fr from 'react-intl/locale-data/fr';
import { addLocaleData, IntlProvider } from 'react-intl';
import jwtDecode from 'jwt-decode';
import { Redirect, Route, Switch } from 'react-router-dom';
import { getSession, getToken, removeSession, setSession } from './utils/session';
import { subscribeToHttpEvent } from './utils/http-client';
import DeprecatedHeader from './components/backoffice/common/deprecated/header/DeprecatedHeader';
import OrganisationPanel from './components/backoffice/organisation/OrganisationPanel.jsx';
import ModerateurRoutes from './components/backoffice/moderateur/ModerateurRoutes';
import MonComptePanel from './components/backoffice/organisation/MonComptePanel';
import GridDisplayer from './components/backoffice/common/GridDisplayer';
import Header from './components/backoffice/common/header/Header';
import MiscRoutes from './components/backoffice/misc/MiscRoutes';
import FinanceurRoutes from './components/backoffice/financeur/FinanceurRoutes';
import ModerateurHeaderItems from './components/backoffice/moderateur/ModerateurHeaderItems';
import FinanceurHeaderItems from './components/backoffice/financeur/FinanceurHeaderItems';
import logoModerateur from './components/backoffice/common/header/logo-moderateur.svg';
import logoFinanceur from './components/backoffice/common/header/logo-financeur.svg';
import logoDefault from './components/backoffice/common/header/logo-default.svg';
import AnonymousRoutes from './components/anonymous/AuthRoutes';
import UserContext from './components/UserContext';
import './App.scss';
import './utils/moment-fr';


addLocaleData([...fr]);

class App extends Component {

    static propTypes = {
        navigator: PropTypes.object.isRequired,
    };

    state = {
        profile: 'anonymous',
        action: null,
    };

    constructor(props) {
        super(props);
        subscribeToHttpEvent('http:error', response => {
            if (response.status === 401) {
                this.onLogout();
            }
        });

        if (getToken()) {
            this.state = {
                ...getSession(),
            };
        }

        const qs = queryString.parse(window.location.search);
        if (qs.action === 'creation') {
            this.state = {
                profile: 'organisme',
                action: 'creation',
                token: qs.token
            };
        }
    }

    onLogout = () => {
        removeSession();
        window.location.href = '/admin';//Reload page to flush all react states
    };

    onLogin = results => {

        setSession({ ...results, ...jwtDecode(results.access_token) });

        this.setState({
            ...getSession(),
        });

        this.props.navigator.goToPage('/admin');
    };

    showBackofficePages = () => {

        let { profile, codeRegion, codeFinanceur, features, id } = this.state;
        let userContext = profile ? { codeRegion, codeFinanceur, profile } : null;
        let backoffices = {
            moderateur: () => ({
                defaultPath: '/admin/moderateur/moderation/avis/stagiaires?status=none',
                headerItems: <ModerateurHeaderItems />,
                routes: <ModerateurRoutes />,
                logo: logoModerateur,
            }),
            financeur: () => ({
                defaultPath: '/admin/financeur/avis/stats',
                headerItems: <FinanceurHeaderItems />,
                routes: <FinanceurRoutes />,
                logo: logoFinanceur,
            }),
            anonymous: () => ({
                defaultPath: '/admin/login',
                headerItems: <div />,
                routes: <AnonymousRoutes onLogin={this.onLogin} navigator={this.props.navigator} />,
                logo: logoDefault,
            })
        };

        //Use new design
        if (['anonymous', 'moderateur', 'financeur'].includes(this.state.profile)) {

            let layout = backoffices[profile]();

            return (
                <UserContext.Provider value={userContext}>
                    <div className="anotea">
                        <Switch>
                            <Redirect exact from="/" to={layout.defaultPath} />
                            <Redirect exact from="/admin" to={layout.defaultPath} />
                        </Switch>

                        <Header items={layout.headerItems} logo={layout.logo} onLogout={this.onLogout} />
                        <MiscRoutes />
                        {layout.routes}
                    </div>
                </UserContext.Provider>
            );
        }

        //Use deprecated design
        return (
            <div className="anotea-deprecated App">
                <DeprecatedHeader
                    handleLogout={this.onLogout}
                    loggedIn={true}
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
                        </div>)}
                />
            </div>
        );
    };

    render() {
        return (
            <>
                <IntlProvider locale="fr">
                    {this.showBackofficePages()}
                </IntlProvider>
                {false && <GridDisplayer />}
            </>
        );
    }
}

export default App;
