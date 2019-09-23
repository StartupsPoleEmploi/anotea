import React from 'react';
import { Route } from 'react-router-dom';
import ReinitialisationMotDePassePage from './ReinitialisationMotDePassePage';
import { createNavigator } from '../../utils/route-utils';
import MotDePasseOubliePage from './MotDePasseOubliePage';

export default class LoginRoutes extends React.Component {

    render() {
        return (
            <>
                <Route
                    path="/admin/mot-de-passe-oublie"
                    render={props => {
                        let navigator = createNavigator(props);
                        return <MotDePasseOubliePage navigator={navigator} />;
                    }}
                />
                <Route
                    path="/admin/reinitialisation-mot-de-passe"
                    render={props => {
                        let navigator = createNavigator(props);
                        return <ReinitialisationMotDePassePage navigator={navigator} />;
                    }}
                />

            </>
        );
    }
}
