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
                            <div className="d-flex" style={{ flexWrap: "wrap", justifyContent: "space-evenly" }}>
                                <div className="flex-grow-1 mr-2">
                                    <label className="sr-only" htmlFor="recherche-organisme">Rechercher un organisme</label>
                                    <InputText
                                        value={this.state.form.search}
                                        id="recherche-organisme"
                                        placeholder="Rechercher un organisme"
                                        icon={<span aria-hidden="true" className="fas fa-search" />}
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
                                        <span aria-hidden="true" className="fas fa-download pr-2"></span>Exporter
                                    </Button>
                                }
                            />
                        }
                        results={
                            results.meta.pagination.totalItems === 0 ?
                                <EmptyResults /> :
                                <>
                                    {
                                        <thead className="row">
                                            <tr className="col-sm-2 offset-md-1 style-col-title">
                                                <th scope="col" className="column-title d-none d-sm-block">Nom et SIRET</th>
                                            </tr>

                                            <tr className="col-2">
                                                <th scope="col" className="column-title d-none d-sm-block">Type</th>
                                            </tr>

                                            <tr className="col-2">
                                                <th scope="col" className="column-title d-none d-sm-block">Statut</th>
                                            </tr>

                                            <tr className="col-1">
                                                <th scope="col" className="column-title d-none d-sm-block">Avis</th>
                                            </tr>

                                            <tr className="col-xs-8 col-sm-4 col-md-3">
                                                <th scope="col" className="column-title d-none d-sm-block">Contact</th>
                                            </tr>

                                            <tr className="col-sm-2 col-md-1">
                                                <th scope="col" className="column-title d-none d-sm-block sr-only">Gestion</th>
                                            </tr>
                                        </thead>
                                    }
                                    <tbody style={{display: "grid"}}>
                                        {
                                            results.organismes.map((organisme, index) => {
                                                return (
                                                    <div key={organisme._id}>
                                                        <Organisme
                                                            organisme={organisme}
                                                            index={index}
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
                                    </tbody>
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
