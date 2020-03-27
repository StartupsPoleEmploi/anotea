import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Panel from '../../common/page/panel/Panel';
import { getPublicStats } from '../../../services/statsService';
import EmptyResults from '../../common/page/panel/results/EmptyResults';
import StagiairesStats from './StagiairesStats';
import AvisStats from './AvisStats';
import FormationStats from './FormationStats';

export default class StatsPanel extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
    };

    constructor() {
        super();
        this.state = {
            results: {},
        };
    }

    componentDidMount() {
        this.fetchStats();
    }

    componentDidUpdate(previous) {
        if (!_.isEqual(this.props.query, previous.query)) {
            this.fetchStats();
        }
    }

    fetchStats = () => {
        return new Promise(async resolve => {
            let results = await getPublicStats(this.props.query);
            this.setState({ results }, () => resolve());
        });
    };

    render() {

        let { query } = this.props;
        let { results } = this.state;

        if (_.isEmpty(results.stats)) {
            return <EmptyResults />;
        }

        return (
            <>
                <Panel
                    className="StatsPanel"
                    results={
                        <div>
                            <div className="row mb-5">
                                <div className="col-12">
                                    <StagiairesStats query={query} stats={results.stats} />
                                </div>
                            </div>
                            <div className="row mb-5">
                                <div className="col-sm-12 col-md-6">
                                    <AvisStats query={query} stats={results.stats} />
                                </div>
                                <div className="col-sm-12 col-md-6">
                                    <FormationStats query={query} stats={results.stats} />
                                </div>
                            </div>
                        </div>
                    }
                />
            </>
        );
    }
}
