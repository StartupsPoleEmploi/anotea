import React, { Component } from 'react';
import PropTypes from 'prop-types';
import jwtDecode from 'jwt-decode';
import { Redirect, Switch } from 'react-router-dom';
import { getSession, getToken, removeSession, setSession } from './utils/session';
import { subscribeToHttpEvent } from '../common/utils/http-client';
import ModerateurRoutes from './components/moderateur/ModerateurRoutes';
import FinanceurRoutes from './components/financeur/FinanceurRoutes';
import ModerateurHeaderItems from './components/moderateur/ModerateurHeaderItems';
import FinanceurHeaderItems from './components/financeur/FinanceurHeaderItems';
import AnonymousRoutes from './components/anonymous/AnonymousRoutes';
import OrganismeHeaderItems from './components/organisme/OrganismeHeaderItems';
import OrganismeRoutes from './components/organisme/OrganismeRoutes';
import './Backoffice.scss';
import Header from './components/common/header/Header';
import AppContext from './BackofficeContext';
import GlobalMessage from './components/common/message/GlobalMessage';
import WithAnalytics from '../common/components/analytics/WithAnalytics';
import StatsRoutes from './components/stats/StatsRoutes';

class Backoffice extends Component {

    static propTypes = {
        router: PropTypes.object.isRequired,
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

        this.props.router.goToPage('/admin');
    };

    showGlobalMessage = message => {
        return this.setState({ message });
    };

    render() {

        let { account, message } = this.state;
        let { router } = this.props;
        let backoffices = {
            moderateur: () => ({
                defaultPath: '/admin/moderateur/moderation/avis/stagiaires?sortBy=lastStatusUpdate&statuses=none',
                headerItems: <ModerateurHeaderItems router={router} />,
                routes: <ModerateurRoutes router={router} />,
            }),
            financeur: () => ({
                defaultPath: '/admin/financeur/avis/stats',
                headerItems: <FinanceurHeaderItems />,
                routes: <FinanceurRoutes router={router} />,
            }),
            organisme: () => ({
                defaultPath: '/admin/organisme/avis/stats',
                headerItems: <OrganismeHeaderItems />,
                routes: <OrganismeRoutes router={router} />,
            }),
            anonymous: () => ({
                defaultPath: '/admin/login',
                headerItems: <div />,
                routes: <AnonymousRoutes onLogin={this.onLogin} router={router} />,
            })
        };

        let layout = backoffices[account.profile]();
        let appContext = {
            account,
            showMessage: this.showGlobalMessage,
        };

        return (
            <WithAnalytics category={`backoffice/${account.profile}`}>
                <AppContext.Provider value={appContext}>
                    <div className="Backoffice">
                        <Switch>
                            <Redirect exact from="/" to={layout.defaultPath} />
                            <Redirect exact from="/admin" to={layout.defaultPath} />
                        </Switch>

                        <Header items={layout.headerItems} defaultPath={layout.defaultPath} onLogout={this.onLogout} />

                        {layout.routes}

                        <StatsRoutes router={router} />,

                        {message &&
                        <GlobalMessage message={message} onClose={() => {
                            return this.setState({ message: null });
                        }}
                        />
                        }
                    </div>
                </AppContext.Provider>
            </WithAnalytics>
        );
    }
}

export default Backoffice;
