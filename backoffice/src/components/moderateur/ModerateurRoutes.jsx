import React from 'react';
import { Route } from 'react-router-dom';
import GestionOrganismePage from './gestion-organismes/GestionOrganismePage';
import CourrielsPage from './courriels/CourrielsPage';
import { createNavigator } from '../../utils/navigator';
import ModerationAvisPage from './moderation-avis/ModerationAvisPage';
import ModerationReponsesPage from './moderation-avis/ModerationReponsesPage';
import MonComptePage from '../misc/MonComptePage';

export default class ModerateurRoutes extends React.Component {

    render() {
        return (
            <>
                <Route path="/admin/moderateur/courriels/stagiaires" render={() => <CourrielsPage type="stagiaires" />} />
                <Route path="/admin/moderateur/courriels/organismes" render={() => <CourrielsPage type="organismes" />} />
                <Route
                    path="/admin/moderateur/gestion/organismes"
                    render={props => {
                        let navigator = createNavigator(props);
                        return <GestionOrganismePage navigator={navigator} />;
                    }}
                />
                <Route
                    path="/admin/moderateur/moderation/avis/stagiaires"
                    render={props => {
                        let navigator = createNavigator(props);
                        return <ModerationAvisPage navigator={navigator} />;
                    }}
                />
                <Route
                    path="/admin/moderateur/moderation/avis/reponses"
                    render={props => {
                        let navigator = createNavigator(props);
                        return <ModerationReponsesPage navigator={navigator} />;
                    }}
                />

                <Route
                    path={'/admin/moderateur/mon-compte'}
                    component={MonComptePage}
                />
            </>
        );
    }
}
