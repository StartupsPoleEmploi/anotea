import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Redirect, Route, Switch } from 'react-router-dom';
import Header from '../common/Header';
import queryString from 'query-string';
import OrganismePanel from './organismes/OrganismePanel';
import StagiairesPanel from './stagiaires/StagiairesPanel';
import { MyAccount } from '../account/MyAccount';

export default class ModerationRoutes extends React.Component {

    static propTypes = {
        codeRegion: PropTypes.string.isRequired,
        logout: PropTypes.func.isRequired,
    };

    getQueryFromUrl = routeProps => {
        return {
            filter: routeProps.match.params.filter,
            page: routeProps.match.params.page,
            search: queryString.parse(routeProps.location.search).search,
        };
    };

    render() {
        return (
            <div className="anotea">
                <Header onLogout={this.props.logout} />
                <Switch>
                    <Redirect exact from="/" to="/admin/moderation/stagiaires/all" />
                    <Redirect exact from="/admin" to="/admin/moderation/stagiaires/all" />
                </Switch>
                <Route
                    path="/mon-compte"
                    render={() => <MyAccount />} />
                <Route
                    path="/admin/moderation/organismes"
                    render={() => <OrganismePanel codeRegion={this.props.codeRegion} />} />
                <Route
                    path="/admin/moderation/stagiaires/:filter/:page?"
                    render={props => {

                        let query = this.getQueryFromUrl(props);
                        return <StagiairesPanel
                            codeRegion={this.props.codeRegion}
                            query={query}
                            onNewQuery={options => {
                                let newQuery = _.merge({ page: 1 }, query, options);

                                props.history.push(`/admin/moderation/stagiaires/${newQuery.filter}/${newQuery.page}` +
                                    (newQuery.search ? `?search=${newQuery.search}` : ''));
                            }} />;
                    }} />
            </div>
        );
    }
}
