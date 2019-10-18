import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Summary from '../../common/page/panel/summary/Summary';
import Pagination from '../../common/page/panel/pagination/Pagination';
import Page from '../../common/page/Page';
import Panel from '../../common/page/panel/Panel';
import { Filter, Filters } from '../../common/page/panel/filters/Filters';
import Avis from '../../common/avis/Avis';
import AvisResults from '../../common/page/panel/results/AvisResults';
import { searchAvis } from '../../../services/avisService';
import { getAvisStats } from '../../../services/statsService';
import { Workflow } from '../../common/avis/Workflow';

export default class ModerationReponsesPage extends React.Component {

    static propTypes = {
        navigator: PropTypes.object.isRequired,
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
        let query = this.props.navigator.getQuery();
        if (!_.isEqual(query, previous.navigator.getQuery())) {
            this.search();
            this.fetchStats();
        }
    }

    search = (options = {}) => {
        return new Promise(resolve => {
            this.setState({ loading: !options.silent }, async () => {
                let query = this.props.navigator.getQuery();
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
        let { navigator } = this.props;
        let query = navigator.getQuery();
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
                                    onClick={() => navigator.refreshCurrentPage({
                                        reponseStatuses: 'none',
                                        sortBy: 'reponse.lastStatusUpdate'
                                    })}
                                />

                                <Filter
                                    label="Validés"
                                    isActive={() => query.reponseStatuses === 'validated'}
                                    onClick={() => navigator.refreshCurrentPage({
                                        reponseStatuses: 'validated',
                                        sortBy: 'reponse.lastStatusUpdate'
                                    })}
                                />

                                <Filter
                                    label="Rejetés"
                                    isActive={() => query.reponseStatuses === 'rejected'}
                                    onClick={() => navigator.refreshCurrentPage({
                                        reponseStatuses: 'rejected',
                                        sortBy: 'reponse.lastStatusUpdate'
                                    })}
                                />

                                <Filter
                                    label="Signalés"
                                    isActive={() => query.statuses === 'reported'}
                                    getNbElements={() => stats.nbCommentairesReported}
                                    onClick={() => navigator.refreshCurrentPage({
                                        statuses: 'reported',
                                        sortBy: 'lastStatusUpdate'
                                    })}
                                />

                                <Filter
                                    label="Tous"
                                    isActive={() => query.reponseStatuses === 'none,validated,rejected'}
                                    onClick={() => navigator.refreshCurrentPage({
                                        reponseStatuses: 'none,validated,rejected',
                                        sortBy: 'date'
                                    })}
                                />

                            </Filters>
                        }
                        summary={
                            <Summary
                                pagination={results.meta.pagination}
                                paginationLabel={query.statuses === 'reported' ? 'avis' : 'réponse(s)'}
                            />
                        }
                        results={
                            <AvisResults
                                results={results}
                                renderAvis={avis => {
                                    return (
                                        <Avis
                                            avis={avis}
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
                                onClick={page => navigator.refreshCurrentPage(_.merge({}, query, { page }))}
                            />
                        }
                    />
                }
            />
        );
    }
}
