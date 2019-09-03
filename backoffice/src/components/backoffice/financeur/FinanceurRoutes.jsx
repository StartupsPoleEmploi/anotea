import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import AvisPanel from './avis/AvisPanel';
import StatistiquesPanel from './stats/StatistiquesPanel';
import MonComptePanel from '../misc/account/mon-compte/MonComptePanel';

export default class FinanceurRoutes extends React.Component {

    static propTypes = {
        profile: PropTypes.string.isRequired,
        codeRegion: PropTypes.string.isRequired,
        codeFinanceur: PropTypes.string.isRequired,
        features: PropTypes.string.isRequired,
    };

    parse = location => {
        return queryString.parse(location.search);
    };

    render() {
        return (
            <div>
                <Route
                    path="/admin/financeur/avis"
                    render={() => (
                        <AvisPanel
                            profile={this.props.profile}
                            codeRegion={this.props.codeRegion}
                            codeFinanceur={this.props.codeFinanceur}
                            features={this.props.features} />
                    )} />
                <Route
                    path="/admin/financeur/statistiques"
                    render={() => (
                        <StatistiquesPanel />
                    )} />
                <Route path="/admin/financeur/mon-compte" component={MonComptePanel} />
            </div>
        );
    }
}
