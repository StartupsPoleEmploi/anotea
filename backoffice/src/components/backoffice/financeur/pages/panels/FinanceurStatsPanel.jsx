import React from 'react';
import PropTypes from 'prop-types';
import './SummaryBadgeTitle.scss';
import _ from 'lodash';
import Summary from '../../../common/panel/panel/summary/Summary';
import Button from '../../../common/library/Button';
import { getExportAvisUrl, getStats } from '../../financeurService';
import SummaryBadgeTitle from './SummaryBadgeTitle';
import NewPanel from '../../../common/panel/panel/NewPanel';
import StatsResults from '../../../common/panel/panel/results/StatsResults';

export default class FinanceurStatsPanel extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
        form: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            results: {},
        };
    }

    componentDidMount() {
        this.fetchStats();
    }

    componentDidUpdate(previous) {
        if (this.props.query !== previous.query) {
            this.fetchStats();
        }
    }

    fetchStats = () => {
        return new Promise(resolve => {
            this.setState({ loading: true }, async () => {
                let results = await getStats(this.props.query);
                this.setState({ results, loading: false }, () => resolve());
            });
        });
    };

    render() {

        let { results } = this.state;
        let { query, form } = this.props;

        return (
            <NewPanel
                summary={
                    <Summary
                        title={<SummaryBadgeTitle form={form} query={query} />}
                        buttons={
                            <Button
                                size="medium"
                                onClick={() => window.open(getExportAvisUrl(_.omit(query, ['page'])))}>
                                <i className="fas fa-download pr-2"></i>Exporter
                            </Button>
                        }
                    />}
                results={
                    <StatsResults results={results} />
                }
            />
        );

    }

}
