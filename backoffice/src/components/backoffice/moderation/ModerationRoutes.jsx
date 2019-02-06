import React from 'react';
import PropTypes from 'prop-types';
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
                    render={props => (<MyAccount {...props} />)} />
                <Route
                    path="/admin/moderation/organismes"
                    render={props => (<OrganismePanel {...props} codeRegion={this.props.codeRegion} />)} />
                <Route
                    path="/admin/moderation/stagiaires/:filter/:page?"
                    render={props => {

                        let parameters = {
                            filter: props.match.params.filter,
                            page: props.match.params.page,
                            stagiaire: queryString.parse(props.location.search).stagiaire
                        };

                        return <StagiairesPanel
                            codeRegion={this.props.codeRegion}
                            parameters={parameters}
                            onChange={params => {
                                let stagiaire = params.stagiaire ? `?stagiaire=${params.stagiaire}` : '';
                                props.history.push(`/admin/moderation/stagiaires/${params.filter}/${params.page || 1}${stagiaire}`);
                            }} />;
                    }} />
            </div>
        );
    }
}
