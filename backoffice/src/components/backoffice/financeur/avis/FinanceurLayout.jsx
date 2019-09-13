import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import Loader from '../../common/Loader';
import Summary from '../../common/panel/summary/Summary';
import Pagination from '../../common/panel/pagination/Pagination';
import Layout from '../../common/panel/Layout';
import { Tab, Tabs } from '../../common/panel/tabs/Tabs';
import { DateRange, Form, Select } from '../../common/panel/form/Form';
import { getDepartements, getExportAvisUrl, getFormations, getOrganismes, searchAvis } from '../financeurService';
import FINANCEURS from '../../common/data/financeurs';
import Button from '../../common/library/Button';
import AvisResults from '../../common/panel/results/AvisResults';
import QuerySummary from '../components/QuerySummary';
import { Filters } from '../../common/panel/filters/Filters';
import Filter from '../../common/panel/filters/Filter';

export default class FinanceurLayout extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
        onNewQuery: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            currentTab: 'avis',
            message: null,
            form: {
                periode: {
                    startDate: null,
                    endDate: null,
                },
                departements: {
                    selected: null,
                    loading: true,
                    results: [],
                },
                organismes: {
                    selected: null,
                    loading: true,
                    results: [],
                },
                formations: {
                    selected: null,
                    loading: false,
                    results: [],
                },
                financeurs: {
                    selected: null,
                    loading: true,
                    results: [],
                },
            },
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

    setStateDeep(data, callback) {
        return this.setState(_.merge({}, this.state, data), callback);
    }

    async componentDidMount() {

        let { query } = this.props;

        this.search();

        this.loadSelectBox('departements', () => getDepartements())
        .then(results => {
            return this.updateSelectBox('departements', results.find(f => f.code === query.departement));
        });

        this.loadSelectBox('organismes', () => getOrganismes())
        .then(results => {
            return this.updateSelectBox('organismes', results.find(f => f.siren === query.siren));
        });

        if (query.siren) {
            this.loadSelectBox('formations', () => getFormations(query.siren))
            .then(results => {
                return this.updateSelectBox('formations', results.find(f => f.idFormation === query.idFormation));
            });
        }

        this.loadSelectBox('financeurs', () => FINANCEURS)
        .then(results => {
            return this.updateSelectBox('financeurs', results.find(f => f.code === query.codeFinanceur));
        });

        this.setStateDeep({
            form: {
                periode: {
                    startDate: query.startDate ? moment(parseInt(query.startDate)).toDate() : null,
                    endDate: query.startDate ? moment(parseInt(query.scheduledEndDate)).toDate() : null,
                },
            }
        });
    }

    componentDidUpdate(previous) {
        if (this.props.query !== previous.query) {
            this.search();
        }
    }

    loadSelectBox = async (type, loader) => {

        this.setStateDeep({
            form: {
                [type]: {
                    selected: null,
                    loading: true,
                    results: [],
                },
            }
        });

        let results = await loader();

        return new Promise(resolve => {
            this.setStateDeep({
                form: {
                    [type]: {
                        selected: null,
                        loading: false,
                        results,
                    },
                }
            }, () => resolve(results));
        });
    };

    updateSelectBox = (type, option) => {
        return new Promise(resolve => {

            this.setStateDeep({
                form: {
                    [type]: {
                        ...this.state[type],
                        selected: option
                    },
                }
            }, resolve);
        });
    };

    resetForm = () => {
        this.setStateDeep({
            form: {
                periode: {
                    startDate: null,
                    endDate: null,
                },
                departements: {
                    selected: null,
                },
                organismes: {
                    selected: null,
                },
                formations: {
                    selected: null,
                },
                financeurs: {
                    selected: null,
                },
            }
        });
    };

    createQuery = (parameters = {}) => {

        let form = this.state.form;

        return {
            codeFinanceur: _.get(form, 'financeurs.selected.code', null),
            departement: _.get(form, 'departements.selected.code', null),
            siren: _.get(form, 'organismes.selected.siren', null),
            idFormation: _.get(form, 'formations.selected.idFormation', null),
            startDate: form.periode.startDate ? moment(form.periode.startDate).valueOf() : null,
            scheduledEndDate: form.periode.endDate ? moment(form.periode.endDate).valueOf() : null,
            status: 'all',
            sortBy: 'date',
            ...parameters,
        };
    };

    search = (options = {}) => {
        return new Promise(resolve => {
            this.setState({ loading: !options.silent }, async () => {
                let results = await searchAvis(this.props.query);
                this.setState({ results, loading: false }, () => resolve());
            });
        });
    };

    render() {
        let { query, onNewQuery } = this.props;
        let { form, results, currentTab } = this.state;
        let { departements, organismes, formations, financeurs, periode } = form;

        return (
            <Layout
                type="financeur"
                form={
                    <Form>
                        <div className="form-row">
                            <div className="form-group col-lg-6 col-xl-3">
                                <label>Période</label>
                                <DateRange
                                    range={periode}
                                    onChange={periode => this.setStateDeep({ form: { periode } })}
                                />
                            </div>
                            <div className="form-group col-lg-6 col-xl-3">
                                <label>Départements</label>
                                <Select
                                    value={departements.selected}
                                    options={departements.results}
                                    loading={departements.loading}
                                    optionKey="code"
                                    optionLabel="label"
                                    placeholder={'Tous les départements'}
                                    onChange={option => this.updateSelectBox('departements', option)}
                                />
                            </div>
                            <div className="form-group col-lg-6">
                                <label>Organisme de formation</label>
                                <Select
                                    value={organismes.selected}
                                    options={organismes.results}
                                    loading={organismes.loading}
                                    optionKey="siren"
                                    optionLabel="name"
                                    placeholder={'Tous les organismes'}
                                    onChange={async option => {
                                        await this.updateSelectBox('organismes', option);
                                        if (option) {
                                            this.loadSelectBox('formations', () => getFormations(option.siren));
                                        }
                                    }}
                                />
                            </div>
                            {organismes.selected &&
                            <div className="form-group col-lg-6 order-xl-last">
                                <label>Formation</label>
                                <Select
                                    value={formations.selected}
                                    options={formations.results}
                                    loading={formations.loading}
                                    optionKey="idFormation"
                                    optionLabel="title"
                                    placeholder={'Toutes les formations'}
                                    onChange={option => this.updateSelectBox('formations', option)}
                                />
                            </div>
                            }
                            <div className="form-group col-lg-6">
                                <label>Financeur</label>
                                <Select
                                    value={financeurs.selected}
                                    options={financeurs.results}
                                    loading={financeurs.loading}
                                    optionKey="code"
                                    optionLabel="label"
                                    placeholder={'Tous les financeurs'}
                                    onChange={option => this.updateSelectBox('financeurs', option)}
                                />
                            </div>
                        </div>
                        <div className="form-row justify-content-center">
                            <div className="form-group buttons">
                                <Button size="small" onClick={this.resetForm} className="mr-3" style={{ opacity: 0.6 }}>
                                    <i className="fas fa-times mr-2"></i>
                                    Réinitialiser les filtres
                                </Button>
                                <Button size="large" color="green" onClick={() => onNewQuery(this.createQuery())}>
                                    Rechercher
                                </Button>
                            </div>
                        </div>
                    </Form>
                }
                tabs={
                    <Tabs>
                        <Tab
                            label="Vue graphique"
                            isActive={() => currentTab === 'stats'}
                            onClick={() => onNewQuery(this.setStateDeep({ currentTab: 'stats' }))} />

                        <Tab
                            label="Liste des avis"
                            isActive={() => currentTab === 'avis'}
                            onClick={() => onNewQuery(this.setStateDeep({ currentTab: 'avis' }))} />
                    </Tabs>
                }
                filters={
                    currentTab !== 'avis' ? <div /> :
                        <Filters>
                            <Filter
                                label="Tous"
                                isActive={() => query.status === 'all'}
                                onClick={() => onNewQuery(this.createQuery({ status: 'all', sortBy: 'date' }))} />

                            <Filter
                                label="Commentaires"
                                isActive={() => query.qualification === 'all'}
                                onClick={() => onNewQuery(this.createQuery({ qualification: 'all', sortBy: 'date' }))} />

                            <Filter
                                label="Négatifs"
                                isActive={() => query.qualification === 'négatif'}
                                onClick={() => onNewQuery(this.createQuery({ qualification: 'négatif', sortBy: 'date' }))} />

                            <Filter
                                label="Positifs ou neutres"
                                isActive={() => query.qualification === 'positif'}
                                onClick={() => onNewQuery(this.createQuery({ qualification: 'positif', sortBy: 'date' }))} />

                            <Filter
                                label="Signalés"
                                isActive={() => query.status === 'reported'}
                                getNbElements={() => _.get(results.meta.stats, 'status.reported')}
                                onClick={() => onNewQuery(this.createQuery({ status: 'reported', sortBy: 'lastStatusUpdate' }))} />

                            <Filter
                                label="Rejetés"
                                isActive={() => query.status === 'rejected'}
                                onClick={() => onNewQuery(this.createQuery({ status: 'rejected', sortBy: 'lastStatusUpdate' }))} />
                        </Filters>

                }
                summary={
                    this.state.loading ? <div /> :
                        <Summary
                            title={<QuerySummary form={this.state.form} query={query} />}
                            paginationLabel="avis"
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
                    this.state.loading ?
                        <div className="d-flex justify-content-center"><Loader /></div> :
                        <AvisResults results={results} message={this.state.message} />
                }
                pagination={
                    this.state.loading || currentTab !== 'avis' ?
                        <div /> :
                        <Pagination
                            pagination={results.meta.pagination}
                            onClick={page => onNewQuery(_.merge({}, query, { page }))} />
                }
            />
        );
    }
}
