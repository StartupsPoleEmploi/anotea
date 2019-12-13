import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import { Route } from 'react-router-dom';
import Page from '../common/page/Page';
import { Tab, Tabs } from '../common/page/tabs/Tabs';
import { Form, Periode, Select } from '../common/page/form/Form';
import { getFormations } from '../../services/formationsService';
import Button from '../common/Button';
import OrganismeAvisPanel from './components/OrganismeAvisPanel';
import OrganismeStatsPanel from './components/OrganismeStatsPanel';
import AppContext from '../AppContext';
import { getDepartements } from '../../services/departementsService';

export default class OrganismePage extends React.Component {

    static contextType = AppContext;

    static propTypes = {
        router: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
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
                sirens: {
                    selected: null,
                    loading: true,
                    results: [],
                },
                formations: {
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

    async componentDidMount() {

        let { account } = this.context;
        let query = this.props.router.getQuery();

        this.loadSelectBox('departements', () => getDepartements())
        .then(results => {
            return this.updateSelectBox('departements', results.find(f => f.code === query.departement));
        });

        this.loadSelectBox('sirens', () => {
            return [
                { siren: account.siret.substring(0, 9), name: 'Tous les centres' }
            ];
        })
        .then(results => {
            return this.updateSelectBox('sirens', results.find(o => o.siren === query.siren));
        });

        this.loadSelectBox('formations', () => getFormations({ organisme: query.organisme || account.siret }))
        .then(results => {
            return this.updateSelectBox('formations', results.find(f => f.idFormation === query.idFormation));
        });

        this.setStateDeep({
            form: {
                periode: {
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

    updateSelectBox = (type, data) => {
        return new Promise(resolve => {
            this.setStateDeep({
                form: {
                    [type]: {
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
                    periode: Object.assign({}, periode),
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
                sirens: {
                    selected: null,
                },
                formations: {
                    selected: null,
                },
            }
        });
    };

    getFormParametersFromQuery = () => {
        let query = this.props.router.getQuery();
        return _.pick(query, ['departement', 'siren', 'idFormation', 'startDate', 'scheduledEndDate']);
    };

    getFormParameters = () => {
        let { form } = this.state;
        return {
            departement: _.get(form, 'departements.selected.code', null),
            siren: _.get(form, 'sirens.selected.siren', null),
            idFormation: _.get(form, 'formations.selected.idFormation', null),
            startDate: form.periode.startDate ? moment(form.periode.startDate).valueOf() : null,
            scheduledEndDate: form.periode.endDate ? moment(form.periode.endDate).valueOf() : null,
        };
    };

    isFormLoading = () => {
        let { form } = this.state;
        return form.departements.loading || form.sirens.loading || form.formations.loading;
    };

    isFormSynchronizedWithQuery = () => {
        let data = _(this.getFormParameters()).omitBy(_.isNil).value();
        return this.isFormLoading() || _.isEqual(data, this.getFormParametersFromQuery());
    };

    onSubmit = () => {
        return this.props.router.refreshCurrentPage(this.getFormParameters());
    };

    onTabClicked = (tab, parameters) => {
        return this.props.router.goToPage(`/admin/organisme/avis/${tab}`, {
            ...this.getFormParametersFromQuery(),
            ...parameters
        });
    };

    onFilterClicked = parameters => {
        return this.props.router.refreshCurrentPage({
            ...this.getFormParametersFromQuery(),
            ...parameters,
        });
    };

    render() {
        let { router } = this.props;
        let { form } = this.state;
        let { departements, sirens, formations, periode } = form;
        let user = this.context;
        let formSynchronizedWithQuery = this.isFormSynchronizedWithQuery();

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
                                <label>Centres</label>
                                <Select
                                    value={sirens.selected}
                                    options={sirens.results}
                                    loading={sirens.loading}
                                    optionKey="organisme"
                                    label={option => option.name}
                                    placeholder={user.raisonSociale}
                                    onChange={async option => {
                                        await this.updateSelectBox('sirens', option);
                                        this.loadSelectBox('formations', () => {
                                            let organisme = option ? option.siren : user.siret;
                                            if (organisme !== router.getQuery().siren) {
                                                return getFormations({ organisme });
                                            }
                                        });
                                    }}
                                />
                            </div>
                            <div className="form-group offset-lg-6 col-lg-6">
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
                        </div>
                        <div className="form-row justify-content-center">
                            <div className="form-group buttons">
                                <Button size="small" onClick={this.resetForm} className="mr-3">
                                    <i className="fas fa-times mr-2"></i>
                                    Réinitialiser les filtres
                                </Button>
                                <Button
                                    size="large"
                                    color="orange"
                                    onClick={() => this.onSubmit()}
                                    style={formSynchronizedWithQuery ? {} : { border: '2px solid' }}
                                >
                                    {!formSynchronizedWithQuery && <i className="fas fa-sync a-icon"></i>}
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
                            isActive={() => router.isActive('/admin/organisme/avis/stats')}
                            onClick={() => this.onTabClicked('stats')} />

                        <Tab
                            label="Liste des avis"
                            isActive={() => router.isActive('/admin/organisme/avis/liste')}
                            onClick={() => this.onTabClicked('liste', { read: false, sortBy: 'date' })} />
                    </Tabs>
                }
                panel={
                    router.isActive('/admin/organisme/avis/liste') ?
                        <OrganismeAvisPanel
                            query={router.getQuery()}
                            onFilterClicked={this.onFilterClicked} /> :
                        <Route
                            path={'/admin/organisme/avis/stats'}
                            render={() => <OrganismeStatsPanel query={router.getQuery()} />}
                        />
                }
            />
        );
    }
}
