import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { getExportAvisUrl, searchOrganismes } from './gestionOrganismesService';
import Organisme from './components/Organisme';
import PaginationSummary from '../../common/page/panel/pagination/PaginationSummary';
import Pagination from '../../common/page/panel/pagination/Pagination';
import ResultDivider from '../../common/page/panel/results/ResultDivider';
import './GestionOrganismePage.scss';
import Page from '../../common/page/Page';
import Panel from '../../common/page/panel/Panel';
import { Filter, Filters } from '../../common/page/panel/filters/Filters';
import { Form } from '../../common/page/form/Form';
import Button from '../../../../common/components/Button';
import InputText from '../../common/page/form/InputText';
import EmptyResults from '../../common/page/panel/results/EmptyResults';
import BackofficeContext from '../../../BackofficeContext';

export default class GestionOrganismePage extends React.Component {

    static contextType = BackofficeContext;

    static propTypes = {
        router: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            form: {
                search: '',
            },
            results: {
                organismes: [],
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

        this.setState({
            form: {
                search: query.search || '',
            }
        });
    }

    componentDidUpdate(previous) {
        let query = this.props.router.getQuery();
        if (!_.isEqual(query, previous.router.getQuery())) {
            this.search();
        }
    }

    search = (options = {}) => {
        return new Promise(resolve => {
            this.setState({ loading: !options.silent }, async () => {
                let query = this.props.router.getQuery();
                let results = await searchOrganismes(query);
                this.setState({ results, loading: false }, () => resolve());
            });
        });
    };

    getFormAsQuery = () => {
        let { form } = this.state;
        return {
            search: form.search,
        };
    };

    render() {
        let { router } = this.props;
        let { showMessage } = this.context;
        let query = router.getQuery();
        let results = this.state.results;

        return (
            <Page
                title="Gestion des organismes"
                className="GestionOrganismePage"
                form={
                    <div className="d-flex justify-content-center">
                        <Form className="a-width-50">
                            <div className="d-flex justify-content-between">
                                <div className="flex-grow-1 mr-2">
                                    <InputText
                                        value={this.state.form.search}
                                        placeholder="Recherche un organisme"
                                        icon={<i className="fas fa-search" />}
                                        reset={() => this.setState({ form: { search: '' } })}
                                        onChange={event => this.setState({ form: { search: event.target.value } })}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    size="large"
                                    color="blue"
                                    onClick={() => router.refreshCurrentPage(this.getFormAsQuery())}
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
                                        return router.refreshCurrentPage({ ...this.getFormAsQuery(), status: 'all' });
                                    }} />

                                <Filter
                                    label="Actifs"
                                    isActive={() => query.status === 'active'}
                                    onClick={() => {
                                        return router.refreshCurrentPage({ ...this.getFormAsQuery(), status: 'active' });
                                    }} />

                                <Filter
                                    label="Inactifs"
                                    isActive={() => query.status === 'inactive'}
                                    onClick={() => {
                                        return router.refreshCurrentPage({ ...this.getFormAsQuery(), status: 'inactive' });
                                    }} />

                            </Filters>
                        }
                        summary={
                            <PaginationSummary
                                paginationLabel="organisme(s)"
                                pagination={results.meta.pagination}
                                buttons={
                                    <Button
                                        size="medium"
                                        onClick={() => window.open(getExportAvisUrl(_.omit(query, ['page'])))}>
                                        <i className="fas fa-download pr-2"></i>Exporter
                                    </Button>
                                }
                            />
                        }
                        results={
                            results.meta.pagination.totalItems === 0 ?
                                <EmptyResults /> :
                                <>
                                    {
                                        <div className="row">
                                            <div className="col-sm-2 offset-md-1">
                                                <p className="column-title d-none d-sm-block">Nom et SIRET</p>
                                            </div>

                                            <div className="col-2">
                                                <p className="column-title d-none d-sm-block">Type</p>
                                            </div>

                                            <div className="col-2">
                                                <p className="column-title d-none d-sm-block">Statut</p>
                                            </div>

                                            <div className="col-1">
                                                <p className="column-title d-none d-sm-block">Avis</p>
                                            </div>

                                            <div className="col-xs-8 col-sm-4 col-md-3">
                                                <p className="column-title d-none d-sm-block">Contact</p>
                                            </div>

                                            <div className="col-sm-2 col-md-1">
                                                <p className="column-title d-none d-sm-block">&nbsp;</p>
                                            </div>
                                        </div>
                                    }
                                    {
                                        results.organismes.map(organisme => {
                                            return (
                                                <div key={organisme._id}>
                                                    <Organisme
                                                        organisme={organisme}
                                                        onChange={(avis, options = {}) => {
                                                            let { message } = options;
                                                            if (message) {
                                                                showMessage(message);
                                                            }
                                                            return this.search({ silent: true });
                                                        }} />
                                                    <ResultDivider />
                                                </div>
                                            );
                                        })
                                    }
                                </>
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
