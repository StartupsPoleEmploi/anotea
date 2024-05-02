import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import { Form, Periode, Select } from '../../common/page/form/Form';
import Button from '../../../../common/components/Button';
import BackofficeContext from '../../../BackofficeContext';

export default class OrganismeForm extends React.Component {

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
            siren: null,
            numeroFormation: null,
        };
    };

    componentDidUpdate(previous) {
        let { query, store } = this.props;
        if (!_.isEqual(previous.store, store) && !this.formAlreadyPopulatedFromQuery) {

            this.setState({
                debut: query.debut ? moment(parseInt(query.debut)).toDate() : null,
                fin: query.fin ? moment(parseInt(query.fin)).toDate() : null,
                departement: _.get(store.departements.find(d => d.code === query.departement), 'code', null),
                siren: _.get(store.sirens.find(s => s.siren === query.siren), 'siren', null),
                numeroFormation: _.get(store.formations.find(f => f.numeroFormation === query.numeroFormation), 'numeroFormation', null),
            });
            this.formAlreadyPopulatedFromQuery = true;
        }
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
        let { account } = this.context;

        return (
            <Form>
                <div className="form-row">
                    <div className="form-group col-lg-6 col-xl-3">
                        <fieldset>
                            <label>Période</label>
                            <Periode
                                periode={{ debut: this.state.debut, fin: this.state.fin }}
                                min={moment('2016-01-01T00:00:00Z').toDate()}
                                onChange={({ debut, fin }) => this.setState({ debut, fin })}
                            />
                        </fieldset>
                    </div>
                    <div className="form-group col-lg-6 col-xl-3">
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
                    </div>
                    <div className="form-group col-lg-6">
                        <label>Centres</label>
                        <Select
                            placeholder={account.raison_sociale}
                            trackingId="Centres"
                            value={this.state.siren}
                            options={store.sirens}
                            loading={store.loading}
                            optionKey="siren"
                            optionLabel="name"
                            onChange={(option = {}) => {
                                this.setState({ siren: option.siren, numeroFormation: null }, () => {
                                    loadFormations(option.siren || account.siret);
                                });
                            }}
                        />
                    </div>
                    <div className="form-group offset-lg-6 col-lg-6">
                        <label>Formation</label>
                        <Select
                            value={this.state.numeroFormation}
                            options={store.formations}
                            loading={store.loading}
                            optionKey="numeroFormation"
                            optionLabel="title"
                            placeholder={'Toutes les formations'}
                            trackingId="Formation"
                            onChange={(option = {}) => this.setState({ numeroFormation: option.numeroFormation })}
                        />
                    </div>
                </div>
                <div className="form-row justify-content-center">
                    <div className="form-group buttons">
                        <Button
                            disabled={store.loading}
                            size="small"
                            onClick={this.resetForm}
                            className="mr-3"
                        >
                            <i className="fas fa-times mr-2"></i>
                            Réinitialiser les filtres
                        </Button>
                        <Button
                            disabled={store.loading}
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
        );
    }
}
