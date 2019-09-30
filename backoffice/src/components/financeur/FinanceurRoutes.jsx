import React from 'react';
import { Route } from 'react-router-dom';
import FinanceurPage from './FinanceurPage';
import { createNavigator } from '../../utils/navigator';
import MonComptePage from '../misc/MonComptePage';

export default class FinanceurRoutes extends React.Component {

    render() {
        return (
            <>
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
            </>
        );
    }
}
