import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { getAvisStats, searchAvis } from '../../../services/avisService';
import Avis from '../../common/avis/Avis';
import { Workflow } from '../../common/avis/Workflow';
import Page from '../../common/page/Page';
import { Filter, Filters } from '../../common/page/panel/filters/Filters';
import Pagination from '../../common/page/panel/pagination/Pagination';
import PaginationSummary from '../../common/page/panel/pagination/PaginationSummary';
import Panel from '../../common/page/panel/Panel';
import AvisResults from '../../common/page/panel/results/AvisResults';

export default class ModerationReponsesPage extends React.Component {

    static propTypes = {
        router: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
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
        let query = this.props.router.getQuery();
        if (!_.isEqual(query, previous.router.getQuery())) {
            this.search();
            this.fetchStats();
        }
    }

    search = (options = {}) => {
        return new Promise(resolve => {
            this.setState({ loading: !options.silent }, async () => {
                let query = this.props.router.getQuery();
                let results = await searchAvis(query);
                this.setState({ results, loading: false }, () => resolve());
            });
        });
    };

    fetchStats = async () => {
        return new Promise(async resolve => {
            let stats = await getAvisStats();
            this.setState({ stats }, () => resolve());
        });
    };

    render() {
        let { router } = this.props;
        let query = router.getQuery();
        let { results, stats } = this.state;

        return (
            <Page
                title="Réponses des organismes"
                className="ModerationReponsesPage"
                panel={
                    <Panel
                        loading={this.state.loading}
                        filters={
                            <Filters>

                                <Filter
                                    label="À modérer"
                                    isActive={() => query.reponseStatuses === 'none'}
                                    getNbElements={() => stats.nbReponseAModerer}
                                    onClick={() => router.refreshCurrentPage({
                                        reponseStatuses: 'none',
                                        sortBy: 'reponse.lastStatusUpdate'
                                    })}
                                />

                                <Filter
                                    label="Validés"
                                    isActive={() => query.reponseStatuses === 'validated'}
                                    onClick={() => router.refreshCurrentPage({
                                        reponseStatuses: 'validated',
                                        sortBy: 'reponse.lastStatusUpdate'
                                    })}
                                />

                                <Filter
                                    label="Rejetés"
                                    isActive={() => query.reponseStatuses === 'rejected'}
                                    onClick={() => router.refreshCurrentPage({
                                        reponseStatuses: 'rejected',
                                        sortBy: 'reponse.lastStatusUpdate'
                                    })}
                                />

                                <Filter
                                    label="Signalés"
                                    isActive={() => query.statuses === 'reported'}
                                    getNbElements={() => stats.nbCommentairesReported}
                                    onClick={() => router.refreshCurrentPage({
                                        statuses: 'reported',
                                        sortBy: 'lastStatusUpdate'
                                    })}
                                />

                                <Filter
                                    label="Tous"
                                    isActive={() => query.reponseStatuses === 'none,validated,rejected'}
                                    onClick={() => router.refreshCurrentPage({
                                        reponseStatuses: 'none,validated,rejected',
                                        sortBy: 'date'
                                    })}
                                />

                            </Filters>
                        }
                        summary={
                            <PaginationSummary
                                pagination={results.meta.pagination}
                                paginationLabel={query.statuses === 'reported' ? 'avis' : 'réponse(s)'}
                            />
                        }
                        results={
                            <AvisResults
                                results={results}
                                renderAvis={(avis, index) => {
                                    return (
                                        <Avis
                                            avis={avis}
                                            index={index}
                                            renderWorkflow={() => {
                                                return <Workflow avis={avis} showStatus={query.statuses !== 'reported'} />;
                                            }}
                                            showReponse={query.statuses !== 'reported'}
                                            showModerationButtons={query.statuses === 'reported'}
                                            showModerationReponseButtons={query.statuses !== 'reported'}
                                            onChange={() => {
                                                return Promise.all([
                                                    this.search({ silent: true }),
                                                    this.fetchStats(),
                                                ]);
                                            }}
                                        />
                                    );
                                }}
                            />
                        }
                        pagination={
                            <Pagination
                                pagination={results.meta.pagination}
                                onClick={page => router.refreshCurrentPage(_.merge({}, query, { page }))}
                            />
                        }
                    />
                }
            />
        );
    }
}
