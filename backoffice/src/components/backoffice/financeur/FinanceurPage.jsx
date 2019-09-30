import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import { Route } from 'react-router-dom';
import Page from '../common/page/Page';
import { Tab, Tabs } from '../common/page/tabs/Tabs';
import { Form, Periode, Select } from '../common/page/form/Form';
import { getSirens } from '../sirensService';
import { getFormations } from '../formationsService';
import { getDepartements } from '../departementsService';
import FINANCEURS from '../common/data/financeurs';
import Button from '../common/Button';
import AvisPanel from './components/AvisPanel';
import StatsPanel from './components/StatsPanel';

export default class FinanceurPage extends React.Component {

    static propTypes = {
        navigator: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            form: {
                periode: {
                    pristine: true,
                    startDate: null,
                    endDate: null,
                },
                departements: {
                    pristine: true,
                    selected: null,
                    loading: true,
                    results: [],
                },
                sirens: {
                    pristine: true,
                    selected: null,
                    loading: true,
                    results: [],
                },
                formations: {
                    pristine: true,
                    selected: null,
                    loading: false,
                    results: [],
                },
                financeurs: {
                    pristine: true,
                    selected: null,
                    loading: true,
                    results: [],
                },
            },
        };
    }

    setStateDeep(data, callback) {
        return this.setState(_.merge({}, this.state, data), callback);
    }

    isPoleEmploi() {
        return this.context.codeFinanceur === '4';
    }

    async componentDidMount() {

        let query = this.props.navigator.getQuery();
        let options = { pristine: true };

        this.loadSelectBox('departements', () => getDepartements())
        .then(results => {
            return this.updateSelectBox('departements', results.find(f => f.code === query.departement), options);
        });

        this.loadSelectBox('sirens', () => getSirens())
        .then(results => {
            return this.updateSelectBox('sirens', results.find(f => f.siren === query.siren), options);
        });

        if (query.siren) {
            this.loadSelectBox('formations', () => getFormations(query.siren))
            .then(results => {
                return this.updateSelectBox('formations', results.find(f => f.idFormation === query.idFormation), options);
            });
        }

        if (this.isPoleEmploi()) {
            this.loadSelectBox('financeurs', () => FINANCEURS)
            .then(results => {
                return this.updateSelectBox('financeurs', results.find(f => f.code === query.codeFinanceur), options);
            });
        }

        this.setStateDeep({
            form: {
                periode: {
                    pristine: true,
                    startDate: query.startDate ? moment(parseInt(query.startDate)).toDate() : null,
                    endDate: query.scheduledEndDate ? moment(parseInt(query.scheduledEndDate)).toDate() : null,
                },
            }
        });
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

    updateSelectBox = (type, data, options = {}) => {
        return new Promise(resolve => {
            this.setStateDeep({
                form: {
                    [type]: {
                        pristine: options.pristine || !data,
                        ...this.state[type],
                        selected: data
                    },
                }
            }, resolve);
        });
    };

    updatePeriode = periode => {
        return new Promise(resolve => {
            this.setStateDeep({
                form: {
                    periode: Object.assign({}, periode, { pristine: (!periode.startDate && !periode.endDate) }),
                }
            }, resolve);
        });
    };

    resetForm = () => {
        this.setStateDeep({
            form: {
                periode: {
                    pristine: true,
                    startDate: null,
                    endDate: null,
                },
                departements: {
                    pristine: true,
                    selected: null,
                },
                sirens: {
                    pristine: true,
                    selected: null,
                },
                formations: {
                    pristine: true,
                    selected: null,
                },
                financeurs: {
                    pristine: true,
                    selected: null,
                },
            }
        });
    };

    isFormPristine = () => {

        let { form } = this.state;

        return form.financeurs.pristine &&
            form.departements.pristine &&
            form.sirens.pristine &&
            form.formations.pristine &&
            form.periode.pristine;
    };

    getQueryFormParameters = () => {
        let query = this.props.navigator.getQuery();
        return _.pick(query, ['codeFinanceur', 'departement', 'siren', 'idFormation', 'startDate', 'scheduledEndDate']);
    };

    onSubmit = () => {
        let { form } = this.state;
        return this.props.navigator.refreshCurrentPage({
            codeFinanceur: _.get(form, 'financeurs.selected.code', null),
            departement: _.get(form, 'departements.selected.code', null),
            siren: _.get(form, 'sirens.selected.siren', null),
            idFormation: _.get(form, 'formations.selected.idFormation', null),
            startDate: form.periode.startDate ? moment(form.periode.startDate).valueOf() : null,
            scheduledEndDate: form.periode.endDate ? moment(form.periode.endDate).valueOf() : null,
        });
    };

    onTabClicked = (tab, parameters = {}) => {
        return this.props.navigator.goToPage(`/admin/financeur/avis/${tab}`, {
            ...this.getQueryFormParameters(),
            ...parameters
        });
    };

    onFilterClicked = parameters => {
        return this.props.navigator.refreshCurrentPage({
            ...this.getQueryFormParameters(),
            ...parameters,
        });
    };

    render() {
        let { navigator } = this.props;
        let { form } = this.state;
        let { departements, sirens, formations, financeurs, periode } = form;
        let query = navigator.getQuery();

        return (
            <Page
                loading={this.state.loading}
                form={
                    <Form>
                        <div className="form-row">
                            <div className="form-group col-lg-6 col-xl-3">
                                <label>Période</label>
                                <Periode
                                    periode={periode}
                                    min={moment('2016-01-01 Z').toDate()}
                                    onChange={periode => this.updatePeriode(periode)}
                                />
                            </div>
                            <div className="form-group col-lg-6 col-xl-3">
                                <label>Départements</label>
                                <Select
                                    value={departements.selected}
                                    options={departements.results}
                                    loading={departements.loading}
                                    optionKey="code"
                                    label={option => option.label}
                                    placeholder={'Tous les départements'}
                                    onChange={option => this.updateSelectBox('departements', option)}
                                />
                            </div>
                            <div className="form-group col-lg-6">
                                <label>Organisme de formation</label>
                                <Select
                                    value={sirens.selected}
                                    options={sirens.results}
                                    loading={sirens.loading}
                                    optionKey="siren"
                                    label={option => option.name}
                                    placeholder={'Tous les organismes'}
                                    onChange={async option => {
                                        await this.updateSelectBox('sirens', option);
                                        if (option) {
                                            this.loadSelectBox('formations', () => getFormations(option.siren));
                                        }
                                    }}
                                />
                            </div>
                            {sirens.selected &&
                            <div className="form-group col-lg-6 order-xl-last">
                                <label>Formation</label>
                                <Select
                                    value={formations.selected}
                                    options={formations.results}
                                    loading={formations.loading}
                                    optionKey="idFormation"
                                    label={option => option.title}
                                    placeholder={'Toutes les formations'}
                                    onChange={option => this.updateSelectBox('formations', option)}
                                />
                            </div>
                            }
                            <div className="form-group col-lg-6">
                                {this.isPoleEmploi() &&
                                <>
                                    <label>Financeur</label>
                                    <Select
                                        value={financeurs.selected}
                                        options={financeurs.results}
                                        loading={financeurs.loading}
                                        optionKey="code"
                                        label={option => option.label}
                                        placeholder={'Tous les financeurs'}
                                        onChange={option => this.updateSelectBox('financeurs', option)}
                                    />
                                </>
                                }
                            </div>
                        </div>
                        <div className="form-row justify-content-center">
                            <div className="form-group buttons">
                                <Button
                                    size="small"
                                    onClick={this.resetForm}
                                    className="mr-3"
                                    style={{ opacity: this.isFormPristine() ? 0.6 : 1 }}
                                >
                                    <i className="fas fa-times mr-2"></i>
                                    Réinitialiser les filtres
                                </Button>
                                <Button size="large" color="green" onClick={() => this.onSubmit()}>
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
                            isActive={() => navigator.isActive('/admin/financeur/avis/stats')}
                            onClick={() => this.onTabClicked('stats')} />

                        <Tab
                            label="Liste des avis"
                            isActive={() => navigator.isActive('/admin/financeur/avis/liste')}
                            onClick={() => this.onTabClicked('liste', { sortBy: 'date' })} />
                    </Tabs>
                }
                panel={
                    navigator.isActive('/admin/financeur/avis/liste') ?
                        <AvisPanel
                            query={query}
                            form={form}
                            onFilterClicked={this.onFilterClicked} /> :
                        <Route
                            path={'/admin/financeur/avis/stats'}
                            render={() => {
                                return (
                                    <StatsPanel
                                        query={query}
                                        form={form}
                                    />
                                );
                            }}
                        />
                }
            />
        );
    }
}
