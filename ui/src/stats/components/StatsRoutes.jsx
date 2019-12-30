import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import _ from 'lodash';
import Loader from '../../common/components/Loader';
import AvisStatsTable from './AvisStatsTable';
import OrganismesStatsTable from './OrganismesStatsTable';
import ApiStatsTable from './ApiStatsTable';
import { getLatestStatistics } from '../services/statsService';
import DiversStatsTable from './DiversStatsTable';

export default class StatsRoutes extends Component {

    constructor(props) {
        super(props);

        this.state = {
            stats: {},
        };
    }

    async componentDidMount() {
        let stats = await getLatestStatistics();
        this.setState({ stats });
    }

    render() {

        let { stats } = this.state;

        if (_.isEmpty(stats)) {
            return <Loader />;
        }

        return (
            <div>
                <Route
                    path="/stats/avis"
                    render={() => <AvisStatsTable stats={stats.avis} campaignStats={stats.campaign} />}
                />
                <Route
                    path="/stats/organismes"
                    render={() => <OrganismesStatsTable stats={stats.organismes} />}
                />
                <Route
                    path="/stats/api"
                    render={() => <ApiStatsTable stats={stats.api} />}
                />
                <Route
                    path="/stats/divers"
                    render={() => <DiversStatsTable />}
                />
            </div>
        );
    }
}

