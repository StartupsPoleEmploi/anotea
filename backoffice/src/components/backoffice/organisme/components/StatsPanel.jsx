import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { getStats } from '../../avisService';
import Panel from '../../common/page/panel/Panel';
import Loader from '../../common/Loader';
import CommentairesStats from '../../common/page/panel/results/stats/CommentairesStats';
import NoteDetails from '../../common/page/panel/results/stats/NoteDetails';
import EmptyResults from '../../common/page/panel/results/EmptyResults';

export default class StatsPanel extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
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

        let stats = this.state.results;

        return (
            <Panel
                results={
                    this.state.loading ?
                        <Loader centered={true} /> :
                        _.isEmpty(stats) ? <EmptyResults /> :
                            <>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <div className="section-title">Les notes</div>
                                        <NoteDetails notes={stats.notes} total={stats.total} />
                                    </div>
                                </div>
                            </>
                }
            />
        );

    }

}
