import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Loader from '../../common/Loader';
import Summary from '../../common/panel/results/Summary';
import Pagination from '../../common/panel/results/Pagination';
import NewPanel from '../../common/panel/NewPanel';
import { Tab, Tabs } from '../../common/panel/toolbar/tabs/Tabs';
import { DateRange, Form, Select } from '../../common/panel/form/Form';
import { getDepartements, getFormations, getOrganismes, searchAvis } from './financeurService';
import FINANCEURS from '../../common/data/financeurs';
import Button from '../../common/library/Button';
import './FinanceurAvisPanel.scss';
import moment from 'moment';
import Badge from '../components/Badge';
import AvisResults from '../../common/panel/results/AvisResults';

export default class FinanceurAvisPanel extends React.Component {

    static propTypes = {
        codeRegion: PropTypes.string.isRequired,
        query: PropTypes.object.isRequired,
        onNewQuery: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            message: null,
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

        this.setState({
            periode: {
                startDate: query.startDate ? moment(parseInt(query.startDate)).toDate() : null,
                endDate: query.startDate ? moment(parseInt(query.scheduledEndDate)).toDate() : null,
            },
        });
    }

    componentDidUpdate(previous) {
        if (this.props.query !== previous.query) {
            this.search();
        }
    }

    loadSelectBox = async (type, loader) => {
        this.setState({
            [type]: {
                selected: null,
                loading: true,
                results: [],
            },
        });

        let results = await loader();

        return new Promise(resolve => {
            this.setState({
                [type]: {
                    selected: null,
                    loading: false,
                    results,
                },
            }, () => resolve(results));
        });
    };

    updateSelectBox = (type, option) => {
        return new Promise(resolve => {
            this.setState({
                [type]: {
                    ...this.state[type],
                    selected: option
                },
            }, resolve);
        });
    };

    resetForm = () => {
        this.setState(_.merge({}, this.state, {
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
        }));
    };

    getQuerySummary = () => {
        let { query } = this.props;

        let departement = this.state.departements.results.find(f => f.code === query.departement);
        let organisme = this.state.organismes.results.find(f => f.siren === query.siren);
        let formation = this.state.formations.results.find(f => f.idFormation === query.idFormation);
        let financeur = this.state.financeurs.results.find(f => f.code === query.codeFinanceur);
        let periode = `${query.startDate ? moment(parseInt(query.startDate)).format('DD/MM/YYYY') : ''}` +
            `${query.startDate && query.scheduledEndDate ? '-' : ''}` +
            `${query.scheduledEndDate ? moment(parseInt(query.scheduledEndDate)).format('DD/MM/YYYY') : ''}`;

        return (
            <div className="d-flex flex-wrap">
                {departement && <Badge color="green" text={departement.label} />}
                {organisme && <Badge color="green" text={organisme.name} />}
                {formation && <Badge color="green" text={formation.title} />}
                {financeur && <Badge color="green" text={financeur.label} />}
                {(query.startDate || query.scheduledEndDate) && <Badge color="green" text={periode} />}
            </div>
        );
    };

    createQuery = (parameters = {}) => {

        let state = this.state;

        return {
            codeFinanceur: _.get(state, 'financeurs.selected.code', null),
            departement: _.get(state, 'departements.selected.code', null),
            siren: _.get(state, 'organismes.selected.siren', null),
            idFormation: _.get(state, 'formations.selected.idFormation', null),
            startDate: state.periode.startDate ? moment(state.periode.startDate).valueOf() : null,
            scheduledEndDate: state.periode.endDate ? moment(state.periode.endDate).valueOf() : null,
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
        let { departements, organismes, formations, financeurs, periode, results } = this.state;

        return (
            <NewPanel
                className="FinanceurAvisPanel"
                type="financeur"
                form={
                    <Form>
                        <div className="form-row">
                            <div className="form-group col-lg-6 col-xl-3">
                                <label>Période</label>
                                <DateRange
                                    range={periode}
                                    onChange={range => this.setState({ periode: range })}
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
                        <div className="form-row">
                        </div>
                        <div className="form-row justify-content-center">
                            <div className="form-group buttons">
                                <Button size="small" onClick={this.resetForm} className="mr-3 reset">
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
                            label="Tous"
                            isActive={() => query.status === 'all'}
                            onClick={() => onNewQuery(this.createQuery({ status: 'all', sortBy: 'date' }))} />

                        <Tab
                            label="Signalés"
                            isActive={() => query.status === 'reported'}
                            getNbElements={() => _.get(results.meta.stats, 'status.reported')}
                            onClick={() => onNewQuery(this.createQuery({ status: 'reported', sortBy: 'lastStatusUpdate' }))} />

                        <Tab
                            label="Rejetés"
                            isActive={() => query.status === 'rejected'}
                            onClick={() => onNewQuery(this.createQuery({ status: 'rejected', sortBy: 'lastStatusUpdate' }))} />

                    </Tabs>
                }
                summary={
                    this.state.loading ? <div /> :
                        <Summary title={this.getQuerySummary()} paginationLabel="avis" pagination={results.meta.pagination} />
                }
                results={
                    this.state.loading ?
                        <div className="d-flex justify-content-center"><Loader /></div> :
                        <AvisResults results={results} message={this.state.message} />
                }
                pagination={
                    this.state.loading ?
                        <div /> :
                        <Pagination
                            pagination={results.meta.pagination}
                            onClick={page => onNewQuery(_.merge({}, query, { page }))} />
                }
            />
        );
    }
}
