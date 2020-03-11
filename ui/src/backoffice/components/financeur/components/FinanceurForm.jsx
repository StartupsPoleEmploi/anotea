import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import { Form, Periode, Select } from '../../common/page/form/Form';
import { getSirens } from '../../../services/sirensService';
import { getFormations } from '../../../services/formationsService';
import { getDepartements } from '../../../services/departementsService';
import { getFinanceurs, getDispositifs } from '../../../services/financeursService';
import { getRegions } from '../../../services/regionsService';
import BackofficeContext from '../../../BackofficeContext';
import Button from '../../../../common/components/Button';

export default class FinanceurForm extends React.Component {

    static contextType = BackofficeContext;

    static propTypes = {
        query: PropTypes.object.isRequired,
        onSubmit: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            periode: {
                debut: null,
                fin: null,
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
                loading: false,
                results: [],
            },
            financeurs: {
                selected: null,
                loading: false,
                results: [],
            },
            dispositifs: {
                selected: null,
                loading: true,
                results: [],
            },
            regions: {
                selected: null,
                loading: true,
                results: [],
            },
        };
    }

    mustShowFinanceurFilter() {
        let { account } = this.context;
        return account.codeFinanceur === '4' || account.profile === 'admin';
    }

    mustShowCodeRegionFilter() {
        let { account } = this.context;
        return account.profile === 'admin';
    }

    async componentDidMount() {

        let { query } = this.props;

        this.loadSelectBox('departements', () => getDepartements())
        .then(results => {
            return this.updateSelectBox('departements', results.find(f => f.code === query.departement));
        });

        this.loadSelectBox('sirens', () => getSirens())
        .then(results => {
            return this.updateSelectBox('sirens', results.find(o => o.siren === query.siren));
        });

        if (query.siren) {
            this.loadSelectBox('formations', () => getFormations({ organisme: query.siren }))
            .then(results => {
                return this.updateSelectBox('formations', results.find(f => f.numeroFormation === query.numeroFormation));
            });
        }

        if (this.mustShowFinanceurFilter()) {
            this.loadSelectBox('financeurs', () => getFinanceurs())
            .then(results => {
                return this.updateSelectBox('financeurs', results.find(f => f.code === query.codeFinanceur));
            });
            this.loadSelectBox('dispositifs', () => getDispositifs())
            .then(results => {
                return this.updateSelectBox('dispositifs', results.find(f => f.code === query.dispositifFinancement));
            });
        } 

        if (this.mustShowCodeRegionFilter()) {
            this.loadSelectBox('regions', () => getRegions())
            .then(results => {
                return this.updateSelectBox('regions', results.find(f => f.codeRegion === query.codeRegion));
            });
        }

        this.setState({
            periode: {
                debut: query.debut ? moment(parseInt(query.debut)).toDate() : null,
                fin: query.fin ? moment(parseInt(query.fin)).toDate() : null,
            },
        });
    }

    getParametersFromQuery = () => {
        let { query } = this.props;
        return _.pick(query, ['codeFinanceur', 'dispositifFinancement', 'codeRegion', 'departement', 'siren', 'numeroFormation', 'debut', 'fin']);
    };

    getFormParameters = () => {
        let { financeurs, dispositifs, regions, departements, sirens, formations, periode } = this.state;
        return {
            codeFinanceur: _.get(financeurs, 'selected.code', null),
            dispositifFinancement: _.get(dispositifs, 'selected.code', null),
            codeRegion: _.get(regions, 'selected.codeRegion', null),
            departement: _.get(departements, 'selected.code', null),
            siren: _.get(sirens, 'selected.siren', null),
            numeroFormation: _.get(formations, 'selected.numeroFormation', null),
            debut: periode.debut ? moment(periode.debut).valueOf() : null,
            fin: periode.fin ? moment(periode.fin).valueOf() : null,
        };
    };

    isFormLoading = () => {
        let { departements, sirens, formations, financeurs } = this.state;
        return departements.loading || sirens.loading || formations.loading || financeurs.loading;
    };

    isFormSynchronizedWithQuery = () => {
        let data = _(this.getFormParameters()).omitBy(_.isNil).value();
        return this.isFormLoading() || _.isEqual(data, this.getParametersFromQuery());
    };

    updatePeriode = periode => {
        return new Promise(resolve => {
            this.setState({
                periode,
            }, resolve);
        });
    };

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

    updateSelectBox = (type, selected) => {
        return new Promise(resolve => {
            this.setState({
                [type]: {
                    ...this.state[type],
                    selected,
                },
            }, resolve);
        });
    };

    resetForm = () => {
        this.setState({
            periode: {
                debut: null,
                fin: null,
            },
            departements: {
                selected: null,
                ..._.pick(this.state.departements, ['results', 'loading']),
            },
            sirens: {
                selected: null,
                ..._.pick(this.state.sirens, ['results', 'loading']),
            },
            formations: {
                selected: null,
                ..._.pick(this.state.formations, ['results', 'loading']),
            },
            financeurs: {
                selected: null,
                ..._.pick(this.state.financeurs, ['results', 'loading']),
            },
            dispositifs: {
                selected: null,
                ..._.pick(this.state.dispositifs, ['results', 'loading']),
            },
            regions: {
                selected: null,
                ..._.pick(this.state.regions, ['results', 'loading']),
            },
        });
    };

    render() {
        let { departements, sirens, formations, financeurs, dispositifs, regions, periode } = this.state;
        let formSynchronizedWithQuery = this.isFormSynchronizedWithQuery();

        return (
            <Form>
                <div className="form-row">
                    <div className="form-group col-lg-6 col-xl-3">
                        <label>Période</label>
                        <Periode
                            periode={periode}
                            min={moment('2016-01-01T00:00:00Z').toDate()}
                            onChange={periode => this.updatePeriode(periode)}
                        />
                    </div>
                    <div className="form-group col-lg-6 col-xl-3">
                        {this.mustShowCodeRegionFilter() ?
                            <>
                                <label>Regions</label>
                                <Select
                                    value={regions.selected}
                                    options={regions.results}
                                    loading={regions.loading}
                                    optionKey="codeRegion"
                                    label={option => option.nom}
                                    placeholder={'Toutes les régions'}
                                    trackingId="Region"
                                    onChange={option => this.updateSelectBox('regions', option)}
                                />
                            </> :
                            <>
                                <label>Départements</label>
                                <Select
                                    value={departements.selected}
                                    options={departements.results}
                                    loading={departements.loading}
                                    optionKey="code"
                                    label={option => option.label}
                                    placeholder={'Tous les départements'}
                                    trackingId="Départements"
                                    onChange={option => this.updateSelectBox('departements', option)}
                                />
                            </>
                        }
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
                            trackingId="Organisme de formation"
                            onChange={async option => {
                                await this.updateSelectBox('sirens', option);
                                if (option) {
                                    this.loadSelectBox('formations', () => getFormations({ organisme: option.siren }));
                                } else {
                                    await this.updateSelectBox('formations', null);
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
                            optionKey="numeroFormation"
                            label={option => option.title}
                            placeholder={'Toutes les formations'}
                            trackingId="Formation"
                            onChange={option => this.updateSelectBox('formations', option)}
                        />
                    </div>
                    }
                    {this.mustShowFinanceurFilter() &&
                    <>
                        <div className="form-group col-lg-3 col-xl-3">
                            <label>Financeur</label>
                            <Select
                                value={financeurs.selected}
                                options={financeurs.results}
                                loading={financeurs.loading}
                                optionKey="code"
                                label={option => option.label}
                                placeholder={'Tous les financeurs'}
                                trackingId="Financeur"
                                onChange={option => this.updateSelectBox('financeurs', option)}
                            />
                        </div>
                        <div className="form-group col-lg-3 col-xl-3">
                            <label>Dispositif financement</label>
                            <Select
                                value={dispositifs.selected}
                                options={dispositifs.results}
                                loading={dispositifs.loading}
                                optionKey="code"
                                label={option => option.code}
                                placeholder={'Tous les dispositifs'}
                                trackingId="Dispositif"
                                onChange={option => this.updateSelectBox('dispositifs', option)}
                            />
                        </div>
                    </>
                    }
                </div>
                <div className="form-row justify-content-center">
                    <div className="form-group buttons">
                        <Button
                            size="small"
                            onClick={this.resetForm}
                            className="mr-3"
                        >
                            <i className="fas fa-times mr-2"></i>
                            Réinitialiser les filtres
                        </Button>
                        <Button
                            size="large"
                            color="green"
                            style={formSynchronizedWithQuery ? {} : { border: '2px solid' }}
                            onClick={() => this.props.onSubmit(this.getFormParameters())}
                        >
                            {!formSynchronizedWithQuery && <i className="fas fa-sync a-icon"></i>}
                            Rechercher
                        </Button>
                    </div>
                </div>
            </Form>
        );
    }
}
