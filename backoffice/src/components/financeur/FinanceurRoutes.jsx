import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import FinanceurPage from './FinanceurPage';
import { createNavigator } from '../../utils/navigator';
import MonComptePage from '../misc/MonComptePage';

export default class FinanceurRoutes extends React.Component {

    render() {
        let redirectToDefaultRoute = () => <Redirect to="/admin/financeur/avis/stats" />;
        return (
            <Switch>
                <Route exact from="/admin/financeur" render={redirectToDefaultRoute} />
                <Route exact from="/admin/financeur/avis" render={redirectToDefaultRoute} />
                <Route
                    path={'/admin/financeur/avis'}
                    render={props => {
                        let navigator = createNavigator(props);
                        return <FinanceurPage navigator={navigator} />;
                    }}
                />
                <Route
                    path={'/admin/financeur/mon-compte'}
                    component={MonComptePage}
                />
            </Switch>
        );
    }
}
