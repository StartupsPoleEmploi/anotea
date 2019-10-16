import React from 'react';
import PropTypes from 'prop-types';
import { Filters } from '../../common/page/panel/filters/Filters';
import Filter from '../../common/page/panel/filters/Filter';
import _ from 'lodash';
import Summary from '../../common/page/panel/summary/Summary';
import Button from '../../common/Button';
import { getExportAvisUrl, searchAvis } from '../../../services/avisService';
import AvisResults from '../../common/page/panel/results/AvisResults';
import Avis from '../../common/avis/Avis';
import Pagination from '../../common/page/panel/pagination/Pagination';
import Panel from '../../common/page/panel/Panel';
import Loader from '../../common/Loader';
import { getAvisStats } from '../../../services/statsService';

export default class OrganismeAvisPanel extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
        onFilterClicked: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            message: null,
            loading: false,
            stats: {},
            results: {
                avis: [],
                meta: {
                    stats: {},
                    pagination: {
                        itemsOnThisPage: 0,
                        itemsPerPage: 0,
                        page: 0,
                        totalItems: 0,
                        totalPages: 0,
                    }
                }
            },
        };
    }

    componentDidMount() {
        this.search();
        this.fetchStats();
    }

    componentDidUpdate(previous) {
        if (!_.isEqual(this.props.query, previous.query)) {
            this.search();
            this.fetchStats();
        }
    }

    search = (options = {}) => {
        return new Promise(resolve => {
            this.setState({ loading: !options.silent }, async () => {
                let results = await searchAvis(this.props.query);
                this.setState({ results, loading: false }, () => resolve());
            });
        });
    };

    fetchStats = async () => {
        return new Promise(async resolve => {
            let query = _.pick(this.props.query, ['departement', 'idFormation', 'startDate', 'scheduledEndDate']);
            let stats = await getAvisStats(query);
            this.setState({ stats }, () => resolve());
        });
    };

    render() {

        let { stats, results, message } = this.state;
        let { query, onFilterClicked } = this.props;

        return (
            <Panel
                filters={
                    <Filters>
                        <Filter
                            label="Nouveaux"
                            isActive={() => query.read === 'false'}
                            getNbElements={() => stats.total - stats.nbRead}
                            onClick={() => onFilterClicked({ read: false, sortBy: 'date' })} />

                        <Filter
                            label="Signalés"
                            isActive={() => query.statuses === 'reported'}
                            onClick={() => onFilterClicked({ statuses: 'reported', sortBy: 'lastStatusUpdate' })}
                        />

                        <Filter
                            label="Répondus"
                            isActive={() => query.reponseStatuses === 'none,published'}
                            onClick={() => onFilterClicked({
                                reponseStatuses: 'none,published',
                                sortBy: 'reponse.lastStatusUpdate'
                            })}
                        />

                        <Filter
                            label="Réponses rejetées"
                            isActive={() => query.reponseStatuses === 'rejected'}
                            onClick={() => onFilterClicked({
                                reponseStatuses: 'rejected',
                                sortBy: 'reponse.lastStatusUpdate'
                            })}
                        />

                        <Filter
                            label="Tous"
                            isActive={() => !query.read && !query.reponseStatuses && !query.reported}
                            onClick={() => onFilterClicked({ sortBy: 'date' })} />

                    </Filters>
                }
                summary={
                    <Summary
                        paginationLabel="avis"
                        pagination={results.meta.pagination}
                        buttons={
                            <Button
                                size="medium"
                                onClick={() => window.open(getExportAvisUrl(_.omit(query, ['page'])))}>
                                <i className="fas fa-download pr-2"></i>Exporter
                            </Button>
                        }
                    />}
                results={
                    this.state.loading ?
                        <Loader centered={true} /> :
                        <AvisResults
                            results={results}
                            message={message}
                            renderAvis={avis => {
                                return <Avis
                                    avis={avis}
                                    showStatus={true}
                                    showReconcilitation={true}
                                    showReponse={true}
                                    showReponseButtons={true}
                                    onChange={() => {
                                        return Promise.all([
                                            this.search({ silent: true }),
                                            this.fetchStats(),
                                        ]);
                                    }}
                                />;
                            }} />
                }
                pagination={
                    <Pagination
                        pagination={results.meta.pagination}
                        onClick={page => onFilterClicked({ ...query, page })} />}
            />
        );

    }

}
