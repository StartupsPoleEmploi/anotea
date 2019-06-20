import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import _ from 'lodash';
import Loader from '../common/Loader';
import AvisStatsTable from './AvisStatsTable';
import OrganismesStatsTable from './OrganismesStatsTable';
import { getLatestStatistics } from '../../services/statsService';

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
                    render={() => <AvisStatsTable stats={stats.avis} />}
                />
                <Route
                    path="/stats/organismes"
                    render={() => <OrganismesStatsTable stats={stats.organismes} />}
                />
            </div>
        );
    }
}

