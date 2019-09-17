import React from 'react';
import PropTypes from 'prop-types';
import '../components/SummaryBadgeTitle.scss';
import _ from 'lodash';
import Button from '../../../common/Button';
import { getExportAvisUrl, getStats } from '../../financeurService';
import NewPanel from '../../../common/page/panel/NewPanel';
import SummaryBadgeTitle from '../components/SummaryBadgeTitle';
import Loader from '../../../common/Loader';
import StatsResults from '../../../common/page/panel/results/stats/StatsResults';

export default class StatsPanel extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
        form: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
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
        return new Promise(resolve => {
            this.setState({ loading: true }, async () => {
                let results = await getStats(this.props.query);
                this.setState({ results, loading: false }, () => resolve());
            });
        });
    };

    render() {

        let { query, form } = this.props;

        return (
            <NewPanel
                backgroundColor="grey"
                summary={
                    <div className="row">
                        <div className="col-sm-10">
                            <SummaryBadgeTitle form={form} query={query} ellipsis={30} />
                        </div>
                    </div>
                }
                results={
                    <div>
                        {this.state.loading ?
                            <div className="d-flex justify-content-center"><Loader /></div> :
                            <StatsResults stats={this.state.results} />
                        }
                    </div>
                }
            />
        );

    }

}
