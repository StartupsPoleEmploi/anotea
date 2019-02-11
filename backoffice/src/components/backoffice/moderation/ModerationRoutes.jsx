import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Redirect, Route, Switch } from 'react-router-dom';
import Header from '../common/Header';
import queryString from 'query-string';
import OrganismePanel from './pages/organismes/OrganismePanel';
import AvisPanel from './pages/avis/AvisPanel';
import { MyAccount } from '../account/MyAccount';

export default class ModerationRoutes extends React.Component {

    static propTypes = {
        codeRegion: PropTypes.string.isRequired,
        logout: PropTypes.func.isRequired,
    };

    getQueryFromUrl = routeProps => {
        let qs = queryString.parse(routeProps.location.search);
        return {
            filter: routeProps.match.params.filter,
            page: routeProps.match.params.page,
            stagiaire: qs.stagiaire,
        };
    };

    render() {
        return (
            <div className="anotea">
                <Header onLogout={this.props.logout} />
                <Switch>
                    <Redirect exact from="/" to="/admin/moderation/avis/all" />
                    <Redirect exact from="/admin" to="/admin/moderation/avis/all" />
                </Switch>
                <Route
                    path="/mon-compte"
                    render={() => <MyAccount />} />
                <Route
                    path="/admin/moderation/organismes"
                    render={() => <OrganismePanel codeRegion={this.props.codeRegion} />} />
                <Route
                    path="/admin/moderation/avis/:filter/:page?"
                    render={props => {

                        let query = this.getQueryFromUrl(props);
                        return <AvisPanel
                            codeRegion={this.props.codeRegion}
                            query={query}
                            onNewQuery={options => {
                                let newQuery = _.merge({ page: 1 }, query, options);

                                props.history.push(`/admin/moderation/avis/${newQuery.filter}/${newQuery.page}` +
                                    (newQuery.stagiaire ? `&stagiaire=${newQuery.stagiaire}` : ''));
                            }} />;
                    }} />
            </div>
        );
    }
}
