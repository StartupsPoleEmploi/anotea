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
                routes: <AnonymousRoutes onLogin={this.onLogin} navigator={this.props.navigator} />,
            })
        };

        let layout = backoffices[this.state.profile]();

        return (
            <>
                <IntlProvider locale="fr">
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
                </IntlProvider>
                {false && <GridDisplayer />}
            </>
        );
    }
}

export default App;
