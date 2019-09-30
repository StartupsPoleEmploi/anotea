import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { getAvisStats, getStagiairesStats } from '../../statsService';
import Panel from '../../common/page/panel/Panel';
import Loader from '../../common/Loader';
import NoteDetails from '../../common/page/panel/results/stats/NoteDetails';
import EmptyResults from '../../common/page/panel/results/EmptyResults';
import StagiairesStats from './StagiairesStats';

export default class StatsPanel extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            avis: {},
            stagiaires: {},
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
        this.setState({ loading: true }, async () => {
            let [avis, stagiaires] = await Promise.all([
                getAvisStats(this.props.query),
                getStagiairesStats(this.props.query)
            ]);
            this.setState({ avis, stagiaires, loading: false });
        });
    };

    render() {

        let { avis, stagiaires } = this.state;

        return (
            <Panel
                results={
                    this.state.loading ?
                        <Loader centered={true} /> :
                        _.isEmpty(avis) ? <EmptyResults /> :
                            <>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <div className="section-title">Les notes</div>
                                        <StagiairesStats avis={avis} stagiaires={stagiaires} />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <div className="section-title">Les notes</div>
                                        <NoteDetails notes={avis.notes} total={avis.total} />
                                    </div>
                                </div>
                            </>
                }
            />
        );

    }
}
