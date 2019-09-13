import React from 'react';
import _ from 'lodash';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import MonComptePanel from '../misc/account/mon-compte/MonComptePanel';
import FinanceurLayout from './avis/FinanceurLayout';

export default class FinanceurRoutes extends React.Component {

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
                        <FinanceurLayout
                            query={this.parse(location)}
                            onNewQuery={options => {
                                history.push(`/admin/financeur/avis?${this.buildParameters(options)}`);
                            }} />
                    )} />
                <Route path="/admin/financeur/mon-compte" component={MonComptePanel} />
            </div>
        );
    }
}
