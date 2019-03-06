import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Redirect, Route, Switch } from 'react-router-dom';
import queryString from 'query-string';
import OrganismePanel from './gestion/organismes/OrganismePanel';
import AvisStagiairesPanel from './moderation/AvisStagiairesPanel';
import AvisReponsesPanel from './moderation/AvisReponsesPanel';
import { MyAccount } from '../account/MyAccount';

export default class ModerateurRoutes extends React.Component {

    static propTypes = {
        codeRegion: PropTypes.string.isRequired,
    };

    parse = location => {
        return queryString.parse(location.search);
    };

    buildParameters = options => {
        let newQuery = _(_.merge({ page: 0 }, options))
        .omitBy(_.isUndefined)
        .omitBy(_.isNull)
        .omitBy(_.isEmpty)
        .value();

        return queryString.stringify(newQuery);
    };

    render() {
        return (
            <div>
                <Switch>
                    <Redirect exact from="/" to="/admin/moderateur/moderation/avis/stagiaires?page=0&status=none" />
                    <Redirect exact from="/admin"
                              to="/admin/moderateur/moderation/avis/stagiaires?page=0&status=none" />
                </Switch>
                <Route path="/mon-compte" render={() => <MyAccount />} />
                <Route
                    path="/admin/moderateur/gestion/organismes"
                    render={({ history, location }) => {
                        return <OrganismePanel
                            codeRegion={this.props.codeRegion}
                            query={this.parse(location)}
                            onNewQuery={options => {
                                history.push(`/admin/moderateur/gestion/organismes?${this.buildParameters(options)}`);
                            }} />;
                    }} />
                <Route
                    path="/admin/moderateur/moderation/avis/stagiaires"
                    render={({ history, location }) => {
                        return <AvisStagiairesPanel
                            codeRegion={this.props.codeRegion}
                            query={this.parse(location)}
                            onNewQuery={options => {
                                history.push(`/admin/moderateur/moderation/avis/stagiaires?${this.buildParameters(options)}`);
                            }} />;
                    }} />
                <Route
                    path="/admin/moderateur/moderation/avis/reponses"
                    render={({ history, location }) => {
                        return <AvisReponsesPanel
                            codeRegion={this.props.codeRegion}
                            query={this.parse(location)}
                            onNewQuery={options => {
                                history.push(`/admin/moderateur/moderation/avis/reponses?${this.buildParameters(options)}`);
                            }} />;
                    }} />
            </div>
        );
    }
}
