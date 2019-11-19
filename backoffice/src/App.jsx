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
import FinanceurRoutes from './components/financeur/FinanceurRoutes';
import ModerateurHeaderItems from './components/moderateur/ModerateurHeaderItems';
import FinanceurHeaderItems from './components/financeur/FinanceurHeaderItems';
import AnonymousRoutes from './components/anonymous/AuthRoutes';
import './utils/moment-fr';
import OrganismeHeaderItems from './components/organisme/OrganismeHeaderItems';
import OrganismeRoutes from './components/organisme/OrganismeRoutes';
import './styles/global.scss';
import Header from './components/common/header/Header';
import MiscRoutes from './components/misc/MiscRoutes';
import UserContext from './components/UserContext';
import queryString from 'query-string';

addLocaleData([...fr]);

class App extends Component {

    static propTypes = {
        navigator: PropTypes.object.isRequired,
    };

    state = {
        profile: 'anonymous',
        loggedIn: false
    };

    constructor(props) {
        super(props);
        subscribeToHttpEvent('http:error', response => {
            if (response.status === 401) {
                this.onLogout();
            }
        });

        const profile = queryString.parse(window.location.search).profile;
        if(profile && ['organisme', 'financeur'].includes(profile)) {
            this.state = {
                profile
            }
        }

        if (getToken()) {
            this.state = {
                ...getSession(),
                loggedIn: true
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
            loggedIn: true
        });

        this.props.navigator.goToPage('/admin');
    };

    render() {

        let backoffices = {
            moderateur: () => ({
                defaultPath: '/admin/moderateur/moderation/avis/stagiaires?sortBy=lastStatusUpdate&statuses=none',
                headerItems: <ModerateurHeaderItems />,
                routes: <ModerateurRoutes />,
            }),
            financeur: () => ({
                defaultPath: '/admin/financeur/avis/stats',
                headerItems: <FinanceurHeaderItems />,
                routes: <FinanceurRoutes />,
            }),
            organisme: () => ({
                defaultPath: '/admin/organisme/avis/stats',
                headerItems: <OrganismeHeaderItems />,
                routes: <OrganismeRoutes />,
            }),
            anonymous: () => ({
                defaultPath: '/admin/login',
                headerItems: <div />,
                routes: <AnonymousRoutes onLogin={this.onLogin} navigator={this.props.navigator} profile={this.state.profile} />,
            })
        };

        let layout = this.state.loggedIn ? backoffices[this.state.profile]() : backoffices['anonymous']();

        return (
            <>
                <IntlProvider locale="fr">
                    <UserContext.Provider value={this.state}>
                        <div className="anotea">
                            <Switch>
                                <Redirect exact from="/" to={layout.defaultPath} />
                                <Redirect exact from="/admin" to={layout.defaultPath} />
                            </Switch>

                            <Header items={layout.headerItems} logo={layout.logo} onLogout={this.onLogout} profile={this.state.profile} loggedIn={this.state.loggedIn} />
                            <MiscRoutes />
                            {layout.routes}
                        </div>
                    </UserContext.Provider>
                </IntlProvider>
                {false && <GridDisplayer />}
            </>
        );
    }
}

export default App;
