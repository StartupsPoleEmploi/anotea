import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import Button from '../../../../common/components/Button';
import { getAvisStats, searchAvis } from '../../../services/avisService';
import Avis from '../../common/avis/Avis';
import { Workflow } from '../../common/avis/Workflow';
import { Form } from '../../common/page/form/Form';
import InputText from '../../common/page/form/InputText';
import Page from '../../common/page/Page';
import { Filter, Filters } from '../../common/page/panel/filters/Filters';
import Pagination from '../../common/page/panel/pagination/Pagination';
import PaginationSummary from '../../common/page/panel/pagination/PaginationSummary';
import Panel from '../../common/page/panel/Panel';
import AvisResults from '../../common/page/panel/results/AvisResults';

export default class ModerationAvisPage extends React.Component {

    static propTypes = {
        router: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            fulltext: '',
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
        let query = this.props.router.getQuery();

        this.search();
        this.fetchStats();

        if (query.fulltext) {
            this.setState({
                fulltext: query.fulltext,
            });
        }
    }

    componentDidUpdate(previous) {
        let query = this.props.router.getQuery();
        let previousQuery = previous.router.getQuery();

        if (!_.isEqual(query, previousQuery)) {
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
            let stats = await getAvisStats(this.getQueryFormParameters());
            this.setState({ stats }, () => resolve());
        });
    };

    getQueryFormParameters = () => {
        let query = this.props.router.getQuery();
        return _.pick(query, ['fulltext']);
    };

    onSubmit = () => {
        return this.props.router.refreshCurrentPage({
            fulltext: this.state.fulltext,
        });
    };

    onFilterClicked = parameters => {
        return this.props.router.refreshCurrentPage({
            ...this.getQueryFormParameters(),
            ...parameters,
        });
    };

    render() {
        let query = this.props.router.getQuery();
        let { results, stats } = this.state;

        return (
            <Page
                title="Avis et données stagiaires"
                className="ModerationAvisPage"
                form={
                    <div className="d-flex justify-content-center">
                        <Form className="a-width-50">
                            <div className="d-flex" style={{ flexWrap: "wrap", justifyContent: "space-evenly" }}>
                                <div className="flex-grow-1 mr-2">
                                    <label className="sr-only" for="recherche-avis">Rechercher un avis</label>
                                    <InputText
                                        id="recherche-avis"
                                        value={this.state.fulltext}
                                        placeholder="Rechercher un avis"
                                        icon={<i className="fas fa-search" />}
                                        reset={() => this.setState({ fulltext: '' })}
                                        onChange={event => this.setState({ fulltext: event.target.value })}
                                    />
                                </div>
                                <Button type="submit" size="large" color="blue" onClick={this.onSubmit}>Rechercher</Button>
                            </div>
                        </Form>
                    </div>
                }
                panel={
                    <Panel
                        loading={this.state.loading}
                        filters={
                            <Filters>
                                <Filter
                                    label="À modérer"
                                    isActive={() => query.statuses === 'none'}
                                    getNbElements={() => stats.nbAModerer}
                                    onClick={() => this.onFilterClicked({ statuses: 'none', sortBy: 'lastStatusUpdate' })}
                                />

                                <Filter
                                    label="Validés"
                                    isActive={() => query.statuses === 'validated'}
                                    onClick={() => {
                                        return this.onFilterClicked({
                                            statuses: 'validated',
                                            commentaires: true,
                                            sortBy: 'lastStatusUpdate'
                                        });
                                    }}
                                />

                                <Filter
                                    label="Rejetés"
                                    isActive={() => query.statuses === 'rejected'}
                                    onClick={() => {
                                        return this.onFilterClicked({
                                            statuses: 'rejected',
                                            commentaires: true,
                                            sortBy: 'lastStatusUpdate'
                                        });
                                    }}
                                />

                                <Filter
                                    label="Tous"
                                    isActive={() => !query.statuses}
                                    onClick={() => this.onFilterClicked({ sortBy: 'date' })}
                                />

                            </Filters>
                        }
                        summary={
                            <PaginationSummary
                                paginationLabel="avis(s)"
                                pagination={results.meta.pagination}
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
                                            showModerationButtons={true}
                                            renderWorkflow={avis => {
                                                return <Workflow avis={avis} showStatus={query.statuses !== 'none'} />;
                                            }}
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
                                onClick={page => this.onFilterClicked({ ...query, page })}
                            />
                        }
                    />
                }
            />
        );
    }
}
