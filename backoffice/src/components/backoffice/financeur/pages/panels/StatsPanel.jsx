import React from 'react';
import PropTypes from 'prop-types';
import '../components/SummaryBadgeTitle.scss';
import _ from 'lodash';
import Button from '../../../common/library/Button';
import { getExportAvisUrl, getStats } from '../../financeurService';
import NewPanel from '../../../common/panel/panel/NewPanel';
import SummaryBadgeTitle from '../components/SummaryBadgeTitle';
import './StatsPanel.scss';
import Pie from '../../../common/panel/panel/results/Pie';
import Loader from '../../../common/Loader';
import NoteDetails from '../components/NoteDetails';

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

        let { results } = this.state;
        let { query, form } = this.props;


        return (
            <NewPanel
                className="StatsPanel"
                summary={
                    <div className="row">
                        <div className="col-sm-10">
                            <SummaryBadgeTitle form={form} query={query} ellipsis={30} />
                        </div>

                        <div className="col-sm-2 text-right">
                            <Button
                                size="medium"
                                onClick={() => window.open(getExportAvisUrl(_.omit(query, ['page'])))}>
                                <i className="fas fa-download pr-2"></i>Exporter
                            </Button>
                        </div>
                    </div>
                }
                results={
                    <div>
                        {this.state.loading ?
                            <div className="d-flex justify-content-center"><Loader /></div> :
                            <>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <div className="stats-title">Les commentaires</div>
                                        <div className="d-flex justify-content-center stats">
                                            <div className="chart">
                                                <div className="title">Modération des commentaires</div>
                                                <div className="description">Sur {results.nbCommentaires} commentaires au total</div>
                                                <Pie data={[
                                                    {
                                                        'id': 'Publiés',
                                                        'value': results.nbPublished,
                                                    },
                                                    {
                                                        'id': 'Rejetés',
                                                        'value': results.nbRejected,
                                                    },
                                                ]} />
                                            </div>
                                            <div className="chart">
                                                <div className="title">Commentaires publiés</div>
                                                <div className="description">Sur {results.nbCommentaires} commentaires au total</div>
                                                <Pie data={[
                                                    {
                                                        'id': 'Positifs',
                                                        'value': results.nbPositifs,
                                                    },
                                                    {
                                                        'id': 'Négatifs',
                                                        'value': results.nbNegatifs,
                                                    },
                                                ]} />
                                            </div>
                                            <div className="chart last">
                                                <div className="title">Commentaires rejetés</div>
                                                <div className="description">Sur {results.nbCommentaires} commentaires au total</div>
                                                <Pie data={[
                                                    {
                                                        'id': 'Non concernés',
                                                        'value': results.nbNonConcernes,
                                                    },
                                                    {
                                                        'id': 'Négatifs',
                                                        'value': results.nbNegatifs,
                                                    },
                                                    {
                                                        'id': 'Injures',
                                                        'value': results.nbInjures,
                                                    },
                                                ]} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <div className="stats-title">Les notes</div>
                                        <NoteDetails notes={results.notes} total={results.total} />
                                    </div>
                                </div>
                            </>
                        }


                    </div>
                }
            />
        );

    }

}
