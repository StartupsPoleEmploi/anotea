import React from 'react';
import _ from 'lodash';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import GestionOrganismePage from './gestion-organismes/GestionOrganismePage';
import ModerationAvisPanel from './moderation-avis/ModerationAvisPanel';
import ModerationReponsesPanel from './moderation-avis/ModerationReponsesPanel';
import CourrielsPage from './courriels/CourrielsPage';
import MonComptePanel from '../misc/account/mon-compte/MonComptePanel';
import { createNavigator } from '../../../utils/route-utils';

export default class ModerateurRoutes extends React.Component {

    parse = location => {
        return queryString.parse(location.search);
    };

    buildParameters = options => {
        let newQuery = _(_.merge({ page: 0 }, options))
        .omitBy(_.isNil)
        .omitBy(value => value === '')
        .value();

        return queryString.stringify(newQuery);
    };

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
                    }} />
                <Route
                    path="/admin/moderateur/moderation/avis/stagiaires"
                    render={({ history, location }) => {
                        return <ModerationAvisPanel
                            query={this.parse(location)}
                            onNewQuery={options => {
                                history.push(`/admin/moderateur/moderation/avis/stagiaires?${this.buildParameters(options)}`);
                            }} />;
                    }} />
                <Route
                    path="/admin/moderateur/moderation/avis/reponses"
                    render={({ history, location }) => {
                        return <ModerationReponsesPanel
                            query={this.parse(location)}
                            onNewQuery={options => {
                                history.push(`/admin/moderateur/moderation/avis/reponses?${this.buildParameters(options)}`);
                            }} />;
                    }} />

                <Route path="/admin/moderateur/mon-compte" component={MonComptePanel} />
            </div>
        );
    }
}
