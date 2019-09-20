import React from 'react';
import { Route } from 'react-router-dom';
import GestionOrganismePage from './gestion-organismes/GestionOrganismePage';
import CourrielsPage from './courriels/CourrielsPage';
import MonComptePanel from '../misc/account/mon-compte/MonComptePanel';
import { createNavigator } from '../../../utils/route-utils';
import ModerationAvisPage from './moderation-avis/ModerationAvisPage';
import ModerationReponsesPage from './moderation-avis/ModerationReponsesPage';

export default class ModerateurRoutes extends React.Component {

    render() {
        return (
            <div>
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

                <Route path="/admin/moderateur/mon-compte" component={MonComptePanel} />
            </div>
        );
    }
}
