import React from 'react';
import { Route } from 'react-router-dom';
import { createNavigator } from '../../../utils/route-utils';
import MonComptePage from '../misc/account/mon-compte/MonComptePage';
import OrganismePage from './OrganismePage';

export default class OrganismeRoutes extends React.Component {

    render() {
        return (
            <div>
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
            </div>
        );
    }
}
