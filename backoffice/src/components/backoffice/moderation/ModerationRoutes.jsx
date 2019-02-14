import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Redirect, Route, Switch } from 'react-router-dom';
import Header from '../common/Header';
import queryString from 'query-string';
import OrganismePanel from './panels/organismes/OrganismePanel';
import AvisStagiairesPanel from './panels/AvisStagiairesPanel';
import AvisReponsesPanel from './panels/AvisReponsesPanel';
import { MyAccount } from '../account/MyAccount';

export default class ModerationRoutes extends React.Component {

    static propTypes = {
        codeRegion: PropTypes.string.isRequired,
        logout: PropTypes.func.isRequired,
    };

    getQueryFromUrl = routeProps => {
        return queryString.parse(routeProps.location.search);
    };

    render() {
        return (
            <div className="anotea">
                <Header onLogout={this.props.logout} />
                <Switch>
                    <Redirect exact from="/" to="/admin/moderation/avis/stagiaires" />
                    <Redirect exact from="/admin" to="/admin/moderation/avis/stagiaires" />
                    <Redirect
                        exact
                        from="/admin/moderation/avis/stagiaires"
                        to="/admin/moderation/avis/stagiaires?page=0&status=none" />
                    <Redirect
                        exact
                        from="/admin/moderation/avis/reponses"
                        to="/admin/moderation/avis/reponses?page=0&reponseStatus=none" />
                </Switch>
                <Route
                    path="/mon-compte"
                    render={() => <MyAccount />} />
                <Route
                    path="/admin/moderation/organismes"
                    render={() => <OrganismePanel codeRegion={this.props.codeRegion} />} />
                <Route
                    path="/admin/moderation/avis/stagiaires"
                    render={props => {
                        return <AvisStagiairesPanel
                            codeRegion={this.props.codeRegion}
                            query={this.getQueryFromUrl(props)}
                            onNewQuery={options => {
                                let newQuery = _.merge({ page: 0 }, options);
                                let parameters = queryString.stringify(newQuery);
                                props.history.push(`/admin/moderation/avis/stagiaires?${parameters}`);
                            }} />;
                    }} />
                <Route
                    path="/admin/moderation/avis/reponses"
                    render={props => {
                        return <AvisReponsesPanel
                            codeRegion={this.props.codeRegion}
                            query={this.getQueryFromUrl(props)}
                            onNewQuery={options => {
                                let newQuery = _.merge({ page: 0 }, options);
                                let parameters = queryString.stringify(newQuery);
                                props.history.push(`/admin/moderation/avis/reponses?${parameters}`);
                            }} />;
                    }} />
            </div>
        );
    }
}
