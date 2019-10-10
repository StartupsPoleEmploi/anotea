import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import { Route } from 'react-router-dom';
import Page from '../common/page/Page';
import { Tab, Tabs } from '../common/page/tabs/Tabs';
import { Form, Periode, Select } from '../common/page/form/Form';
import { getFormations } from '../../services/formationsService';
import { getDepartements } from '../../services/departementsService';
import Button from '../common/Button';
import AvisPanel from './components/AvisPanel';
import StatsPanel from './components/StatsPanel';
import UserContext from '../UserContext';

export default class OrganismePage extends React.Component {

    static contextType = UserContext;

    static propTypes = {
        navigator: PropTypes.object.isRequired,
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

        let user = this.context;
        let query = this.props.navigator.getQuery();
        let options = { pristine: true };

        this.loadSelectBox('departements', () => getDepartements())
        .then(results => {
            return this.updateSelectBox('departements', results.find(f => f.code === query.departement), options);
        });

        this.loadSelectBox('formations', () => getFormations({ organisme: user.siret }))
        .then(results => {
            return this.updateSelectBox('formations', results.find(f => f.idFormation === query.idFormation), options);
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
                formations: {
                    selected: null,
                },
            }
        });
    };

    getFormParametersFromQuery = () => {
        let query = this.props.navigator.getQuery();
        return _.pick(query, ['departement', 'idFormation', 'startDate', 'scheduledEndDate']);
    };

    getFormParameters = () => {
        let { form } = this.state;
        return {
            departement: _.get(form, 'departements.selected.code', null),
            idFormation: _.get(form, 'formations.selected.idFormation', null),
            startDate: form.periode.startDate ? moment(form.periode.startDate).valueOf() : null,
            scheduledEndDate: form.periode.endDate ? moment(form.periode.endDate).valueOf() : null,
        };
    };

    isFormLoading = () => {
        let { form } = this.state;
        return form.departements.loading || form.formations.loading;
    };

    isFormSynchronizedWithQuery = () => {
        let data = _(this.getFormParameters()).omitBy(_.isNil).value();
        return this.isFormLoading() || _.isEqual(data, this.getFormParametersFromQuery());
    };

    onSubmit = () => {
        return this.props.navigator.refreshCurrentPage(this.getFormParameters());
    };

    onTabClicked = (tab, parameters) => {
        return this.props.navigator.goToPage(`/admin/organisme/avis/${tab}`, {
            ...this.getFormParametersFromQuery(),
            ...parameters
        });
    };

    onFilterClicked = parameters => {
        return this.props.navigator.refreshCurrentPage({
            ...this.getFormParametersFromQuery(),
            ...parameters,
        });
    };

    render() {
        let { navigator } = this.props;
        let { form } = this.state;
        let { departements, formations, periode } = form;
        let formSynchronizedWithQuery = this.isFormSynchronizedWithQuery();

        return (
            <Page
                loading={this.state.loading}
                form={
                    <Form>
                        <div className="form-row">
                            <div className="form-group col-lg-4">
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
                            <div className="form-group col-lg-4">
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
                            <div className="form-group col-lg-4">
                                <label>Période</label>
                                <Periode
                                    periode={periode}
                                    min={moment('2016-01-01 Z').toDate()}
                                    onChange={periode => this.updatePeriode(periode)}
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
                            isActive={() => navigator.isActive('/admin/organisme/avis/stats')}
                            onClick={() => this.onTabClicked('stats')} />

                        <Tab
                            label="Liste des avis"
                            isActive={() => navigator.isActive('/admin/organisme/avis/liste')}
                            onClick={() => this.onTabClicked('liste', { read: false, sortBy: 'date' })} />
                    </Tabs>
                }
                panel={
                    navigator.isActive('/admin/organisme/avis/liste') ?
                        <AvisPanel
                            query={navigator.getQuery()}
                            onFilterClicked={this.onFilterClicked} /> :
                        <Route
                            path={'/admin/organisme/avis/stats'}
                            render={() => <StatsPanel query={navigator.getQuery()} />}
                        />
                }
            />
        );
    }
}
