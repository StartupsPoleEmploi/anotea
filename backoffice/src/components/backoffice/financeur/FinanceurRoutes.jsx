import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route, Switch } from 'react-router-dom';
import queryString from 'query-string';
import MonComptePanel from '../account/MonComptePanel';
import FinancerPanel from './FinancerPanel';
import StatistiquesPanel from './StatistiquesPanel';

export default class FinanceurRoutes extends React.Component {

    static propTypes = {
        profile: PropTypes.string.isRequired,
        codeRegion: PropTypes.string.isRequired,
        codeFinanceur: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired,
        features: PropTypes.string.isRequired,
    };

    parse = location => {
        return queryString.parse(location.search);
    };

    render() {
        return (
            <div>
                <Switch>
                    <Redirect exact from="/" to="/admin/financeur/avis" />
                    <Redirect exact from="/admin"
                        to="/admin/financeur/avis" />
                </Switch>
                <Route path="/mon-compte" component={MonComptePanel} />
                <Route
                    path="/admin/financeur/avis"
                    render={() => (
                        <FinancerPanel
                            profile={this.props.profile}
                            id={this.props.id}
                            codeRegion={this.props.codeRegion}
                            codeFinanceur={this.props.codeFinanceur}
                            features={this.props.features} />
                    )} />
                <Route
                    path="/admin/financeur/statistiques"
                    render={() => (
                        <StatistiquesPanel />
                    )} />
            </div>
        );
    }
}
