import React, { Component } from 'react';
import PropTypes from 'prop-types';
import fr from 'react-intl/locale-data/fr';
import { addLocaleData, IntlProvider } from 'react-intl';
import jwtDecode from 'jwt-decode';
import { Redirect, Route, Switch } from 'react-router-dom';
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
import UserContext from './components/UserContext';
import LibraryPage from './components/misc/LibraryPage';

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
                headerItems: <ModerateurHeaderItems />,
                routes: <ModerateurRoutes />,
            }),
            financeur: () => ({
                headerItems: <FinanceurHeaderItems />,
                routes: <FinanceurRoutes />,
            }),
            organisme: () => ({
                headerItems: <OrganismeHeaderItems />,
                routes: <OrganismeRoutes />,
            }),
            anonymous: () => ({
                headerItems: <div />,
                routes: <AnonymousRoutes onLogin={this.onLogin} navigator={this.props.navigator} />,
            })
        };

        let profile = this.state.profile;
        let layout = backoffices[profile]();
        let defaultPath = profile === 'anonymous' ? '/admin/login' : `/admin/${profile}`;

        return (
            <>
                <IntlProvider locale="fr">
                    <UserContext.Provider value={this.state}>
                        <div className="anotea">
                            <Switch>
                                <Redirect exact from="/" to={defaultPath} />
                                <Redirect exact from="/admin" to={defaultPath} />
                            </Switch>
                            <Header items={layout.headerItems} onLogout={this.onLogout} />
                            {layout.routes}
                            <Route exact path="/admin/library" render={() => <LibraryPage />} />
                            <Route render={() => <Redirect to={defaultPath} />} />
                        </div>
                    </UserContext.Provider>
                </IntlProvider>
                {false && <GridDisplayer />}
            </>
        );
    }
}

export default App;
