import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
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
