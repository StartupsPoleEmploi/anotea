import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Summary from '../../common/page/panel/summary/Summary';
import Pagination from '../../common/page/panel/pagination/Pagination';
import Page from '../../common/page/Page';
import Panel from '../../common/page/panel/Panel';
import { Filter, Filters } from '../../common/page/panel/filters/Filters';
import { Form } from '../../common/page/form/Form';
import Button from '../../common/Button';
import InputText from '../../common/page/form/InputText';
import Avis from '../../common/avis/Avis';
import AvisResults from '../../common/page/panel/results/AvisResults';
import { searchAvis } from './moderationService';

export default class ModerationAvisPage extends React.Component {

    static propTypes = {
        navigator: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            message: null,
            form: {
                fulltext: '',
            },
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
        let query = this.props.navigator.getQuery();

        this.search();

        this.setState({
            form: {
                fulltext: query.fulltext,
            }
        });
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

    getFormAsQuery = () => {
        let { form } = this.state;
        return {
            fulltext: form.fulltext,
        };
    };

    render() {
        let { navigator } = this.props;
        let query = navigator.getQuery();
        let results = this.state.results;

        return (
            <Page
                title="Avis et données stagiaires"
                className="ModerationAvisPage"
                form={
                    <div className="d-flex justify-content-center">
                        <Form className="w-50">
                            <div className="d-flex justify-content-between">
                                <div className="a-flex-grow-1 mr-2">
                                    <InputText
                                        value={this.state.form.fulltext}
                                        placeholder="Recherche un avis"
                                        icon={<i className="fas fa-search" />}
                                        reset={() => this.setState({ form: { fulltext: '' } })}
                                        onChange={event => this.setState({ form: { fulltext: event.target.value } })}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    size="large"
                                    color="blue"
                                    onClick={() => navigator.refreshCurrentPage(this.getFormAsQuery())}
                                >
                                    Rechercher
                                </Button>
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
                                    label="Tous"
                                    isActive={() => !query.status || query.status === 'all'}
                                    onClick={() => {
                                        return navigator.refreshCurrentPage({
                                            ...this.getFormAsQuery(),
                                            status: 'all',
                                            sortBy: 'date'
                                        });
                                    }}
                                />

                                <Filter
                                    label="À modérer"
                                    isActive={() => query.status === 'none'}
                                    getNbElements={() => _.get(results.meta.stats, 'status.none')}
                                    onClick={() => {
                                        return navigator.refreshCurrentPage({
                                            ...this.getFormAsQuery(),
                                            status: 'none',
                                            sortBy: 'lastStatusUpdate'
                                        });
                                    }}
                                />

                                <Filter
                                    label="Publiés"
                                    isActive={() => query.status === 'published'}
                                    onClick={() => {
                                        return navigator.refreshCurrentPage({
                                            ...this.getFormAsQuery(),
                                            status: 'published',
                                            sortBy: 'lastStatusUpdate'
                                        });
                                    }}
                                />

                                <Filter
                                    label="Rejetés"
                                    isActive={() => query.status === 'rejected'}
                                    onClick={() => {
                                        return navigator.refreshCurrentPage({
                                            ...this.getFormAsQuery(),
                                            status: 'rejected',
                                            sortBy: 'lastStatusUpdate'
                                        });
                                    }}
                                />

                            </Filters>
                        }
                        summary={
                            <Summary
                                paginationLabel="organisme(s)"
                                pagination={results.meta.pagination}
                            />
                        }
                        results={
                            <AvisResults
                                results={results}
                                message={this.state.message}
                                renderAvis={avis => {
                                    return (
                                        <Avis
                                            avis={avis}
                                            showStatus={['all', 'rejected'].includes(query.status)}
                                            showReponse={false}
                                            onChange={(avis, options) => {
                                                let { message } = options;
                                                if (message) {
                                                    this.setState({ message });
                                                }
                                                return this.search({ silent: true });
                                            }}>
                                        </Avis>
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
