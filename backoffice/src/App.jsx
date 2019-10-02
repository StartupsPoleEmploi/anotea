import React, { Component } from 'react';
import PropTypes from 'prop-types';
import fr from 'react-intl/locale-data/fr';
import { addLocaleData, IntlProvider } from 'react-intl';
import jwtDecode from 'jwt-decode';
import { Redirect, Switch } from 'react-router-dom';
import { getSession, getToken, removeSession, setSession } from './utils/session';
import { subscribeToHttpEvent } from './utils/http-client';
import ModerateurRoutes from './components/moderateur/ModerateurRoutes';
import GridDisplayer from './components/common/GridDisplayer';
import Header from './components/common/header/Header';
import MiscRoutes from './components/misc/MiscRoutes';
import FinanceurRoutes from './components/financeur/FinanceurRoutes';
import ModerateurHeaderItems from './components/moderateur/ModerateurHeaderItems';
import FinanceurHeaderItems from './components/financeur/FinanceurHeaderItems';
import logoModerateur from './components/common/header/logo-moderateur.svg';
import logoFinanceur from './components/common/header/logo-financeur.svg';
import logoOrganisme from './components/common/header/logo-organisme.svg';
import logoDefault from './components/common/header/logo-default.svg';
import AnonymousRoutes from './components/anonymous/AuthRoutes';
import UserContext from './components/UserContext';
import './utils/moment-fr';
import OrganismeHeaderItems from './components/organisme/OrganismeHeaderItems';
import OrganismeRoutes from './components/organisme/OrganismeRoutes';
import './styles/global.scss';

addLocaleData([...fr]);

class App extends Component {

    static propTypes = {
        navigator: PropTypes.object.isRequired,
    };

    state = {
        profile: 'anonymous',
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

        let backoffices = {
            moderateur: () => ({
                defaultPath: '/admin/moderateur/moderation/avis/stagiaires?sortBy=lastStatusUpdate&status=none',
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
            organisme: () => ({
                defaultPath: '/admin/organisme/avis/stats',
                headerItems: <OrganismeHeaderItems />,
                routes: <OrganismeRoutes />,
                logo: logoOrganisme,
            }),
            anonymous: () => ({
                defaultPath: '/admin/login',
                headerItems: <div />,
                routes: <AnonymousRoutes onLogin={this.onLogin} navigator={this.props.navigator} />,
                logo: logoDefault,
            })
        };

        let layout = backoffices[this.state.profile]();

        return (
            <UserContext.Provider value={this.state}>
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
