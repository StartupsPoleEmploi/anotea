import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import { Route } from 'react-router-dom';
import Page from '../../common/page/Page';
import { Tab, Tabs } from '../../common/page/tabs/Tabs';
import { Form, Periode, Select } from '../../common/page/form/Form';
import { getDepartements, getFormations, getOrganismes } from '../financeurService';
import FINANCEURS from '../../common/data/financeurs';
import Button from '../../common/Button';
import UserContext from '../../../UserContext';
import AvisPanel from './panels/AvisPanel';
import StatsPanel from './panels/StatsPanel';

export default class FinanceurPage extends React.Component {

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

        if (this.isPoleEmploi()) {
            this.loadSelectBox('financeurs', () => FINANCEURS)
            .then(results => {
                return this.updateSelectBox('financeurs', results.find(f => f.code === query.codeFinanceur));
            });
        }

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

    getFormAsQuery = () => {
        let { form } = this.state;
        return {
            codeFinanceur: _.get(form, 'financeurs.selected.code', null),
            departement: _.get(form, 'departements.selected.code', null),
            siren: _.get(form, 'organismes.selected.siren', null),
            idFormation: _.get(form, 'formations.selected.idFormation', null),
            startDate: form.periode.startDate ? moment(form.periode.startDate).valueOf() : null,
            scheduledEndDate: form.periode.endDate ? moment(form.periode.endDate).valueOf() : null,
        };
    };

    onSubmit = () => {
        return this.props.navigator.refreshCurrentPage(this.getFormAsQuery());
    };

    onTabClicked = (tab, data) => {
        return this.props.navigator.goToPage(`/admin/financeur/${tab}`, {
            ...this.getFormAsQuery(),
            ...data
        });
    };

    render() {
        let { navigator } = this.props;
        let { form } = this.state;
        let { departements, organismes, formations, financeurs, periode } = form;

        return (
            <Page
                color="green"
                loading={this.state.loading}
                form={
                    <Form>
                        <div className="form-row">
                            <div className="form-group col-lg-6 col-xl-3">
                                <label>Période</label>
                                <Periode
                                    periode={periode}
                                    min={moment('2016-01-01 Z').toDate()}
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
                                {this.isPoleEmploi() &&
                                <>
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
                                </>
                                }
                            </div>
                        </div>
                        <div className="form-row justify-content-center">
                            <div className="form-group buttons">
                                <Button size="small" onClick={this.resetForm} className="mr-3" style={{ opacity: 0.6 }}>
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
                            isActive={() => navigator.isActive('/admin/financeur/stats')}
                            onClick={() => this.onTabClicked('stats')} />

                        <Tab
                            label="Liste des avis"
                            isActive={() => navigator.isActive('/admin/financeur/avis')}
                            onClick={() => this.onTabClicked('avis', { status: 'all' })} />
                    </Tabs>
                }
                panel={
                    navigator.isActive('/admin/financeur/avis') ?
                        <AvisPanel
                            query={navigator.getQuery()}
                            form={form}
                            onNewQuery={data => {
                                return navigator.refreshCurrentPage({
                                    ...this.getFormAsQuery(),
                                    ...data,
                                });
                            }} /> :
                        <Route
                            path={'/admin/financeur/stats'}
                            render={() => {
                                return (
                                    <StatsPanel
                                        query={navigator.getQuery()}
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
