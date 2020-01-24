import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Panel from '../../common/page/panel/Panel';
import { getPublicStats } from '../../../services/statsService';
import Button from '../../../../common/components/Button';
import EmptyResults from '../../common/page/panel/results/EmptyResults';
import GlobalStats from './GlobalStats';
import OrganismeStats from './OrganismeStats';
import FormationStats from './FormationStats';
import CommentairesStats from './CommentairesStats';

export default class StatsPanel extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
        onFilterClicked: PropTypes.func.isRequired,
    };

    constructor() {
        super();
        this.state = {
            stats: null,
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
            let stats = await getPublicStats(this.props.query);
            this.setState({ stats }, () => resolve());
        });
    };

    render() {

        let { query } = this.props;

        if (_.isEmpty(this.state.stats)) {
            return <EmptyResults />;
        }

        return (
            <Panel
                className="StatsPanel"
                summary={
                    <div className="row">
                        <div className="offset-sm-8 col-sm-4 text-right">
                            <Button
                                size="medium"
                                onClick={() => console.log('export')}>
                                <i className="fas fa-download pr-2"></i>Exporter
                            </Button>
                        </div>
                    </div>
                }
                results={
                    <div>
                        <div className="row mb-4">
                            <div className="col-12">
                                <GlobalStats query={query} stats={this.state.stats} />
                            </div>
                        </div>
                        <div className="row mb-4">
                            <div className="col-6">
                                <OrganismeStats query={query} stats={this.state.stats} />
                                <div className="mt-4">
                                    <CommentairesStats query={query} stats={this.state.stats} />
                                </div>
                            </div>
                            <div className="col-6">
                                <FormationStats query={query} stats={this.state.stats} />
                            </div>
                        </div>
                    </div>
                }
            />
        );
    }
}
