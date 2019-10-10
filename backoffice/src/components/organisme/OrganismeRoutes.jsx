import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { createNavigator } from '../../utils/navigator';
import MonComptePage from '../misc/MonComptePage';
import OrganismePage from './OrganismePage';

export default class OrganismeRoutes extends React.Component {

    render() {
        let redirectToDefaultRoute = () => <Redirect to="/admin/organisme/avis/stats" />;

        return (
            <Switch>
                <Route exact from="/admin/organisme" render={redirectToDefaultRoute} />
                <Route exact from="/admin/organisme/avis" render={redirectToDefaultRoute} />
                <Route
                    path={'/admin/organisme/avis'}
                    render={props => {
                        let navigator = createNavigator(props);
                        return <OrganismePage navigator={navigator} />;
                    }}
                />
                <Route
                    path={'/admin/organisme/mon-compte'}
                    component={MonComptePage}
                />
            </Switch>
        );
    }
}
