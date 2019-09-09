import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import FinanceurStatistiquesPanel from './stats/FinanceurStatistiquesPanel';
import MonComptePanel from '../misc/account/mon-compte/MonComptePanel';
import FinanceurAvisPanel from './avis/FinanceurAvisPanel';

export default class FinanceurRoutes extends React.Component {

    static propTypes = {
        codeRegion: PropTypes.string.isRequired,
        codeFinanceur: PropTypes.string.isRequired,
    };

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
                <Route
                    path="/admin/financeur/avis"
                    render={({ history, location }) => (
                        <FinanceurAvisPanel
                            codeRegion={this.props.codeRegion}
                            codeFinanceur={this.props.codeFinanceur}
                            query={this.parse(location)}
                            onNewQuery={options => {
                                history.push(`/admin/financeur/avis?${this.buildParameters(options)}`);
                            }} />
                    )} />
                <Route
                    path="/admin/financeur/statistiques"
                    render={() => (
                        <FinanceurStatistiquesPanel />
                    )} />
                <Route path="/admin/financeur/mon-compte" component={MonComptePanel} />
            </div>
        );
    }
}
