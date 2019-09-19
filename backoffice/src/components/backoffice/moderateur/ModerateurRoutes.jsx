import React from 'react';
import _ from 'lodash';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import OrganismePanel from './gestion-organismes/OrganismePanel';
import ModerationAvisPanel from './moderation-avis/ModerationAvisPanel';
import ModerationReponsesPanel from './moderation-avis/ModerationReponsesPanel';
import CourrielsPage from './courriels/CourrielsPage';
import MonComptePanel from '../misc/account/mon-compte/MonComptePanel';

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
                    render={({ history, location }) => {
                        return <OrganismePanel
                            query={this.parse(location)}
                            onNewQuery={options => {
                                history.push(`/admin/moderateur/gestion/organismes?${this.buildParameters(options)}`);
                            }} />;
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
