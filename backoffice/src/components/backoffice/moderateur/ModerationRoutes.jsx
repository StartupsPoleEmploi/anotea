import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Redirect, Route, Switch } from 'react-router-dom';
import Header from '../common/Header';
import queryString from 'query-string';
import OrganismePanel from './organismes/OrganismePanel';
import AvisStagiairesPanel from './moderation/AvisStagiairesPanel';
import AvisReponsesPanel from './moderation/AvisReponsesPanel';
import { MyAccount } from '../account/MyAccount';

export default class ModerationRoutes extends React.Component {

    static propTypes = {
        codeRegion: PropTypes.string.isRequired,
        logout: PropTypes.func.isRequired,
    };

    parse = location => {
        return queryString.parse(location.search);
    };

    buildParameters = options => {
        let newQuery = _(_.merge({ page: 0 }, options)).omitBy(_.isUndefined).omitBy(_.isNull).value();
        return queryString.stringify(newQuery);
    };

    render() {
        return (
            <div className="anotea">
                <Switch>
                    <Redirect exact from="/" to="/admin/moderation/avis/stagiaires?page=0&status=none" />
                    <Redirect exact from="/admin" to="/admin/moderation/avis/stagiaires?page=0&status=none" />
                </Switch>
                <Header onLogout={this.props.logout} />
                <Route path="/mon-compte" render={() => <MyAccount />} />
                <Route
                    path="/admin/moderation/organismes"
                    render={({ history, location }) => {
                        return <OrganismePanel
                            codeRegion={this.props.codeRegion}
                            query={this.parse(location)}
                            onNewQuery={options => {
                                history.push(`/admin/moderation/organismes?${this.buildParameters(options)}`);
                            }} />;
                    }} />
                <Route
                    path="/admin/moderation/avis/stagiaires"
                    render={({ history, location }) => {
                        return <AvisStagiairesPanel
                            codeRegion={this.props.codeRegion}
                            query={this.parse(location)}
                            onNewQuery={options => {
                                history.push(`/admin/moderation/avis/stagiaires?${this.buildParameters(options)}`);
                            }} />;
                    }} />
                <Route
                    path="/admin/moderation/avis/reponses"
                    render={({ history, location }) => {
                        return <AvisReponsesPanel
                            codeRegion={this.props.codeRegion}
                            query={this.parse(location)}
                            onNewQuery={options => {
                                history.push(`/admin/moderation/avis/reponses?${this.buildParameters(options)}`);
                            }} />;
                    }} />
            </div>
        );
    }
}
