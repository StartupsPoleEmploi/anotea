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

export default class ModerationReponsesPage extends React.Component {

    static propTypes = {
        navigator: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
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
    }

    componentDidUpdate(previous) {
        let query = this.props.navigator.getQuery();
        if (!_.isEqual(query, previous.navigator.getQuery())) {
            this.search();
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

    render() {
        let { navigator } = this.props;
        let query = navigator.getQuery();
        let results = this.state.results;

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
                                    isActive={() => query.reponseStatus === 'none'}
                                    getNbElements={() => _.get(results.meta.stats, 'reponseStatus.none')}
                                    onClick={() => navigator.refreshCurrentPage({
                                        reponseStatus: 'none',
                                        sortBy: 'reponse.lastStatusUpdate'
                                    })}
                                />

                                <Filter
                                    label="Publiés"
                                    isActive={() => query.reponseStatus === 'published'}
                                    onClick={() => navigator.refreshCurrentPage({
                                        reponseStatus: 'published',
                                        sortBy: 'reponse.lastStatusUpdate'
                                    })}
                                />

                                <Filter
                                    label="Rejetés"
                                    isActive={() => query.reponseStatus === 'rejected'}
                                    onClick={() => navigator.refreshCurrentPage({
                                        reponseStatus: 'rejected',
                                        sortBy: 'reponse.lastStatusUpdate'
                                    })}
                                />

                                <Filter
                                    label="Signalés"
                                    isActive={() => query.reported}
                                    onClick={() => navigator.refreshCurrentPage({
                                        reported: true,
                                        sortBy: 'lastStatusUpdate'
                                    })}
                                    getNbElements={() => _.get(results.meta.stats, 'reported')}
                                />

                                <Filter
                                    label="Tous"
                                    isActive={() => query.reponseStatus === 'all'}
                                    onClick={() => navigator.refreshCurrentPage({
                                        reponseStatus: 'all',
                                        sortBy: 'date'
                                    })}
                                />

                            </Filters>
                        }
                        summary={
                            <Summary
                                pagination={results.meta.pagination}
                                paginationLabel={query.status === 'reported' ? 'avis' : 'réponse(s)'}
                            />
                        }
                        results={
                            <AvisResults
                                results={results}
                                renderAvis={avis => {
                                    return (
                                        <Avis
                                            avis={avis}
                                            showReponse={!query.reported}
                                            showModerationButtons={!!query.reported}
                                            showModerationReponseButtons={!query.reported}
                                            onChange={() => this.search({ silent: true })}
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
