import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { getAvisStats } from '../../../services/statsService';
import Panel from '../../common/page/panel/Panel';
import QueryBadges from './QueryBadges';
import Loader from '../../common/Loader';
import CommentairesStats from './CommentairesStats';
import NoteDetails from '../../common/page/panel/results/stats/NoteDetails';
import EmptyResults from '../../common/page/panel/results/EmptyResults';
import Button from '../../common/Button';
import { printPDF } from '../../../utils/print';
import logo from '../../common/print/logo-anoteable-print.png';
import moment from 'moment';
import NoteExplications from '../../common/page/panel/results/stats/NoteExplications';


export default class FinanceurStatsPanel extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
        form: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            results: {},
            pdf: false,
        };
        this.printable = React.createRef();
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
                let results = await getAvisStats(this.props.query);
                this.setState({ results, loading: false }, () => resolve());
            });
        });
    };

    render() {

        let { query, form } = this.props;
        let stats = this.state.results;

        return (
            <>
                <Panel
                    backgroundColor="grey"
                    summary={
                        <div className="row">
                            <div className="col-sm-10">
                                <QueryBadges form={form} query={query} ellipsis={30} />
                            </div>
                            <div className="col-sm-2 text-right">
                                <Button
                                    size="medium"
                                    disabled={this.state.pdf}
                                    onClick={() => {
                                        this.setState({ pdf: true }, async () => {
                                            window.scrollTo(0, 0);
                                            new Promise(resolve => setTimeout(() => resolve(), 250))
                                            .then(() => printPDF(this.printable.current))
                                            .then(() => this.setState({ pdf: false }));
                                        });
                                    }}>
                                    <i className="fas fa-download pr-2"></i>Exporter
                                </Button>
                            </div>
                        </div>
                    }
                    results={
                        this.state.loading ? <Loader centered={true} /> :
                            _.isEmpty(stats) ? <EmptyResults /> : (
                                <>
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <div className="section-title">Les commentaires</div>
                                            <CommentairesStats stats={stats} />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <div className="section-title">Les notes</div>
                                            <NoteDetails notes={stats.notes} total={stats.total} />
                                        </div>
                                    </div>
                                </>
                            )
                    }
                />
                {this.state.pdf &&
                <div ref={this.printable}>
                    <Panel
                        className={`a-printable`}
                        summary={
                            <>
                                <div className="row align-items-center">
                                    <div className="col-sm-2">
                                        <img src={logo} className="logo" alt="logo" width={'80%'} />
                                    </div>
                                    <div className="offset-sm-7 col-sm-3 text-right">
                                        Données exportées le {moment().format('DD/MM/YYYY')}
                                    </div>
                                </div>
                                <div className="row" style={{ paddingTop: '30px' }}>
                                    <div className="col-sm-12">
                                        <QueryBadges form={form} query={query} ellipsis={300} />
                                    </div>
                                </div>
                            </>
                        }
                        results={
                            _.isEmpty(stats) ? <EmptyResults /> : (
                                <>
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <div className="section-title">Les commentaires</div>
                                            <CommentairesStats stats={stats} />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <div className="section-title">Les notes</div>
                                            <NoteExplications notes={stats.notes} total={stats.total} />
                                        </div>
                                    </div>
                                </>
                            )
                        }
                    />
                </div>
                }
            </>
        );

    }

}
