import React from 'react';
import { Route } from 'react-router-dom';
import MonComptePanel from '../misc/account/mon-compte/MonComptePanel';
import FinanceurPage from './pages/FinanceurPage';
import { createNavigator } from '../../../utils/route-utils';

export default class FinanceurRoutes extends React.Component {

    render() {
        return (
            <div>
                <Route
                    path={'/admin/financeur/avis'}
                    render={props => {
                        let navigator = createNavigator(props);
                        return <FinanceurPage navigator={navigator} />;
                    }}
                />
                <Route path="/admin/financeur/mon-compte" component={MonComptePanel} />
            </div>
        );
    }
}
