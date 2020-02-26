import React, { Component } from 'react';
import PropTypes from 'prop-types';
import jwtDecode from 'jwt-decode';
import { getSession, getToken, removeSession, setSession } from './utils/session';
import { subscribeToHttpEvent } from '../common/utils/http-client';
import ModerateurRoutes from './components/moderateur/ModerateurRoutes';
import FinanceurRoutes from './components/financeur/FinanceurRoutes';
import ModerateurHeaderItems from './components/moderateur/ModerateurHeaderItems';
import FinanceurHeaderItems from './components/financeur/FinanceurHeaderItems';
import AnonymousRoutes from './components/anonymous/AnonymousRoutes';
import OrganismeHeaderItems from './components/organisme/OrganismeHeaderItems';
import './Backoffice.scss';
import Header from './components/common/header/Header';
import BackofficeContext from './BackofficeContext';
import GlobalMessage from './components/common/message/GlobalMessage';
import WithAnalytics from '../common/components/analytics/WithAnalytics';
import { Chunk } from './components/common/Chunk';
import OrganismeRoutes from './components/organisme/OrganismeRoutes';

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
        window.location.href = '/backoffice';//Reload page to flush all react states
    };

    onLogin = results => {

        setSession({ ...results, ...jwtDecode(results.access_token) });

        this.setState({
            account: getSession(),
        });

        this.props.router.goToPage('/backoffice');
    };

    showGlobalMessage = message => {
        return this.setState({ message });
    };

    render() {

        let { account, message } = this.state;
        let { router } = this.props;
        let backoffices = {
            moderateur: {
                theme: {
                    backgroundColor: 'blue',
                    buttonColor: 'blue',
                },
                components: () => {
                    return {
                        header: <Chunk name="header" load={() => (<ModerateurHeaderItems router={router} />)} />,
                        routes: <Chunk name="moderateur" load={() => (<ModerateurRoutes router={router} />)} />
                    };
                },
            },
            organisme: {
                theme: {
                    backgroundColor: 'black',
                    buttonColor: 'orange',
                },
                components: () => {
                    return {
                        header: <Chunk name="header" load={() => (<OrganismeHeaderItems />)} />,
                        routes: <Chunk name="organisme" load={() => (<OrganismeRoutes router={router} />)} />
                    };
                },
            },
            financeur: {
                theme: {
                    backgroundColor: 'green',
                    buttonColor: 'green',
                },
                components: () => {
                    return {
                        header: <Chunk name="header" load={() => (<FinanceurHeaderItems />)} />,
                        routes: <Chunk name="financeur" load={() => (<FinanceurRoutes router={router} />)} />
                    };
                },
            },
            admin: {
                theme: {
                    backgroundColor: 'green',
                    buttonColor: 'green',
                },
                components: () => {
                    return {
                        header: <Chunk name="header" load={() => (<FinanceurHeaderItems />)} />,
                        routes: <Chunk name="financeur" load={() => (<FinanceurRoutes router={router} />)} />
                    };
                },
            },
            anonymous: {
                theme: {
                    backgroundColor: 'black',
                    buttonColor: 'orange',
                },
                components: () => {
                    return {
                        header: <div />,
                        routes: <AnonymousRoutes onLogin={this.onLogin} router={router} />
                    };
                },
            },
        };

        let { theme, components } = backoffices[account.profile];
        let { header, routes } = components();
        let context = {
            account,
            theme,
            showMessage: this.showGlobalMessage,
        };

        return (
            <WithAnalytics category={`backoffice/${account.profile}`}>
                <BackofficeContext.Provider value={context}>
                    <div className="Backoffice">
                        <Header
                            items={header}
                            defaultPath={`/backoffice/${account.profile}`}
                            onLogout={this.onLogout}
                        />
                        {routes}
                        {message &&
                        <GlobalMessage message={message} onClose={() => this.setState({ message: null })} />
                        }
                    </div>
                </BackofficeContext.Provider>
            </WithAnalytics>
        );
    }
}

export default Backoffice;
