import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
import OrganismeHeaderItems from './components/organisme/OrganismeHeaderItems';
import OrganismeRoutes from './components/organisme/OrganismeRoutes';
import './styles/global.scss';
import Header from './components/common/header/Header';
import MiscRoutes from './components/misc/MiscRoutes';
import AppContext from './components/AppContext';
import GlobalMessage from './components/common/message/GlobalMessage';

class App extends Component {

    static propTypes = {
        navigator: PropTypes.object.isRequired,
    };

    state = {
        account: {
            profile: 'anonymous',
        },
        message: null,
    };

    constructor(props) {
        super(props);
        subscribeToHttpEvent('http:error', response => {
            if (response.status === 401) {
                this.onLogout();
            } else if (response.status > 429) {
                this.setState({
                    message: {
                        text: 'Désolé, le service est actuellement indisponible. Merci de réessayer plus tard',
                        color: 'red',
                    }
                });
            }
        });

        if (getToken()) {
            this.state = {
                account: getSession(),
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
            account: getSession(),
        });

        this.props.navigator.goToPage('/admin');
    };

    showGlobalMessage = message => {
        return this.setState({ message });
    };

    render() {

        let { account, message } = this.state;
        let { navigator } = this.props;
        let backoffices = {
            moderateur: () => ({
                defaultPath: '/admin/moderateur/moderation/avis/stagiaires?sortBy=lastStatusUpdate&statuses=none',
                headerItems: <ModerateurHeaderItems />,
                routes: <ModerateurRoutes navigator={navigator} />,
            }),
            financeur: () => ({
                defaultPath: '/admin/financeur/avis/stats',
                headerItems: <FinanceurHeaderItems />,
                routes: <FinanceurRoutes navigator={navigator} />,
            }),
            organisme: () => ({
                defaultPath: '/admin/organisme/avis/stats',
                headerItems: <OrganismeHeaderItems />,
                routes: <OrganismeRoutes navigator={navigator} />,
            }),
            anonymous: () => ({
                defaultPath: '/admin/login',
                headerItems: <div />,
                routes: <AnonymousRoutes onLogin={this.onLogin} navigator={navigator} />,
            })
        };

        let layout = backoffices[account.profile]();
        let appContext = {
            account,
            showMessage: this.showGlobalMessage,
        };

        return (
            <>
                <AppContext.Provider value={appContext}>
                    <div className="anotea">
                        <Switch>
                            <Redirect exact from="/" to={layout.defaultPath} />
                            <Redirect exact from="/admin" to={layout.defaultPath} />
                        </Switch>

                        <Header items={layout.headerItems} logo={layout.logo} onLogout={this.onLogout} />
                        <MiscRoutes />
                        {layout.routes}
                    </div>
                    {message &&
                    <GlobalMessage
                        message={message}
                        onClose={() => {
                            return this.setState({ message: null });
                        }} />
                    }
                </AppContext.Provider>
                {false && <GridDisplayer />}
            </>

        );
    }
}

export default App;
