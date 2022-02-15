import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import { Form, Periode, Select } from '../../common/page/form/Form';
import BackofficeContext from '../../../BackofficeContext';
import Button from '../../../../common/components/Button';
import InputText from '../../common/page/form/InputText';

export default class FinanceurForm extends React.Component {

    static contextType = BackofficeContext;

    static propTypes = {
        query: PropTypes.object.isRequired,
        store: PropTypes.object.isRequired,
        loadFormations: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = this.initState();
    }

    initState = () => {
        return {
            debut: null,
            fin: null,
            departement: null,
            siret: null,
            siren: null,
            numeroFormation: null,
            codeFinanceur: null,
            dispositifFinancement: null,
            codeRegion: null,
        };
    };

    componentDidUpdate(previous) {
        if (!_.isEqual(previous.store, this.props.store) && !this.formAlreadyPopulatedFromQuery) {
            let { query, store } = this.props;

            this.setState({
                debut: query.debut ? moment(parseInt(query.debut)).toDate() : null,
                fin: query.fin ? moment(parseInt(query.fin)).toDate() : null,
                departement: _.get(store.departements.find(d => d.code === query.departement), 'code', null),
                siret: query.siret ? query.siret : '',
                siren: _.get(store.sirens.find(s => s.siren === query.siren), 'siren', null),
                numeroFormation: _.get(store.formations.find(f => f.numeroFormation === query.numeroFormation), 'numeroFormation', null),
                codeFinanceur: _.get(store.financeurs.find(f => f.code === query.codeFinanceur), 'code', null),
                dispositifFinancement: _.get(store.dispositifs.find(d => d.code === query.dispositifFinancement), 'code', null),
                codeRegion: _.get(store.regions.find(f => f.codeRegion === query.codeRegion), 'codeRegion', null),
            });
            this.formAlreadyPopulatedFromQuery = true;
        }
    }

    mustShowFinanceurFilter() {
        let { account } = this.context;
        return account.codeFinanceur === '4' || account.profile === 'admin';
    }

    mustShowCodeRegionFilter() {
        let { account } = this.context;
        return account.profile === 'admin';
    }

    isFormSynchronizedWithQuery = () => {
        let { query, store } = this.props;
        return store.loading || _.isEqual(_.pickBy(this.state), query);
    };

    resetForm = () => {
        this.setState(this.initState());
    };

    onSubmit = () => {
        let { debut, fin } = this.state;

        return this.props.onSubmit({
            ..._.omitBy(this.state, _.isNil),
            ...(debut ? { debut: moment(debut).valueOf() } : {}),
            ...(fin ? { fin: moment(fin).valueOf() } : {}),
        });
    };

    render() {
        let formSynchronizedWithQuery = this.isFormSynchronizedWithQuery();
        let { store, loadFormations } = this.props;

        return <Form>
            <div className="form-row">
                <div className="form-group col-lg-6 col-xl-6">
                    <label>Période</label>
                    <Periode
                        periode={{ debut: this.state.debut, fin: this.state.fin }}
                        min={moment('2016-01-01T00:00:00Z').toDate()}
                        onChange={({ debut, fin }) => this.setState({ debut, fin })}
                    />
                </div>
                <div className="form-group col-lg-6 col-xl-6">
                    {this.mustShowCodeRegionFilter() ?
                        <>
                            <label>Regions</label>
                            <Select
                                placeholder={'Toutes les régions'}
                                trackingId="Region"
                                loading={store.loading}
                                value={this.state.codeRegion}
                                options={store.regions}
                                optionKey="codeRegion"
                                optionLabel="nom"
                                onChange={(option = {}) => this.setState({ codeRegion: option.codeRegion })}
                            />
                        </> :
                        <>
                            <label>Départements</label>
                            <Select
                                placeholder={'Tous les départements'}
                                trackingId="Départements"
                                loading={store.loading}
                                value={this.state.departement}
                                options={store.departements}
                                optionKey="code"
                                optionLabel="label"
                                onChange={(option = {}) => this.setState({ departement: option.code })}
                            />
                        </>
                    }
                </div>

                <div className="form-group col-lg-4">
                    <label>SIRET de l&apos;organisme de formation</label>
                    <InputText
                        value={this.state.siret}
                        placeholder="000000000000000"
                        icon={<i className="fas fa-search" />}
                        reset={() => this.setState({ siret: '' })}
                        onChange={
                            (event = {}) => {
                                const nouveauSIRET = event.target.value;
                                const nouveauSIREN = store.sirens.find(s => s.siren === nouveauSIRET.substring(0, 9));
                                console.error('nouveauSIRET', nouveauSIRET, 'nouveauSIREN', nouveauSIREN);
                                this.setState({
                                    siret: nouveauSIRET,
                                    siren: nouveauSIREN?.siren,
                                    numeroFormation: null
                                }, () => {
                                    if (nouveauSIREN) {
                                        loadFormations(nouveauSIREN.siren);
                                    }
                                });
                            }
                        }
                    />
                </div>
                <div className="form-group col-lg-4">
                    <label>Nom de l&apos;organisme de formation</label>
                    <Select
                        placeholder={'Tous les organismes'}
                        trackingId="Nom de l'organisme de formation"
                        loading={store.loading}
                        value={this.state.siren}
                        options={store.sirens}
                        optionKey="siren"
                        optionLabel="name"
                        onChange={(option = {}) => {
                            this.setState({ siren: option.siren, numeroFormation: null }, () => {
                                loadFormations(option.siren);
                            });
                        }}
                    />
                </div>
                {this.state.siren &&
                <div className={`form-group col-lg-4`}>
                    <label>Formation</label>
                    <Select
                        placeholder={'Toutes les formations'}
                        trackingId="Formation"
                        loading={store.loading}
                        value={this.state.numeroFormation}
                        options={store.formations}
                        optionKey="numeroFormation"
                        optionLabel="title"
                        onChange={(option = {}) => this.setState({ numeroFormation: option.numeroFormation })}
                    />
                </div>
                }
                {this.mustShowFinanceurFilter() &&
                <>
                    <div className="form-group col-lg-5 col-xl-5">
                        <label>Financeur</label>
                        <Select
                            placeholder={'Tous les financeurs'}
                            trackingId="Financeur"
                            loading={store.loading}
                            value={this.state.codeFinanceur}
                            options={store.financeurs}
                            optionKey="code"
                            optionLabel="label"
                            onChange={(option = {}) => this.setState({ codeFinanceur: option.code })}
                        />
                    </div>
                    <div className="form-group col-lg-5 col-xl-5">
                        <label>Dispositif de financement</label>
                        <Select
                            placeholder={'Tous les dispositifs'}
                            trackingId="Dispositif"
                            loading={store.loading}
                            value={this.state.dispositifFinancement}
                            options={store.dispositifs}
                            optionKey="code"
                            optionLabel="code"
                            onChange={(option = {}) => this.setState({ dispositifFinancement: option.code })}
                        />
                    </div>
                </>
                }
            </div>
            <div className="form-row justify-content-center">
                <div className="form-group buttons">
                    <Button
                        size="small"
                        className="mr-3"
                        disabled={store.loading}
                        onClick={this.resetForm}
                    >
                        <i className="fas fa-times mr-2"></i>
                        Réinitialiser les filtres
                    </Button>
                    <Button
                        size="large"
                        color="green"
                        style={formSynchronizedWithQuery ? {} : { border: '2px solid' }}
                        disabled={store.loading}
                        onClick={() => this.onSubmit()}
                    >
                        {!formSynchronizedWithQuery && <i className="fas fa-sync a-icon"></i>}
                        Rechercher
                    </Button>
                </div>
            </div>
        </Form>;
    }
}
