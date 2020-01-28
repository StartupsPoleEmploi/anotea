import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../../../common/components/Button';
import _ from 'lodash';
import moment from 'moment';
import { Form, Periode, Select } from '../../common/page/form/Form';
import { getRegions } from '../../../services/regionsService';
import BackofficeContext from '../../../BackofficeContext';

export default class StatsForm extends React.Component {

    static contextType = BackofficeContext;

    static propTypes = {
        query: PropTypes.object.isRequired,
        onSubmit: PropTypes.func.isRequired,
    };

    constructor() {
        super();
        this.state = {
            periode: {
                debut: null,
                fin: null,
            },
            regions: {
                selected: null,
                loading: true,
                results: [],
            },
        };
    }

    async componentDidMount() {

        let { query } = this.props;

        this.loadSelectBox('regions', () => getRegions())
        .then(results => {
            return this.updateSelectBox('regions', results.find(r => r.codeRegion === query.codeRegion));
        });

        this.setState({
            periode: {
                debut: query.debut ? moment(parseInt(query.debut)).toDate() : null,
                fin: query.fin ? moment(parseInt(query.fin)).toDate() : null,
            },
        });
    }

    getFormParametersFromQuery = () => {
        let { query } = this.props;
        return _.pick(query, ['codeRegion', 'debut', 'fin']);
    };

    getFormParameters = () => {
        let { periode, regions } = this.state;

        return {
            debut: periode.debut ? moment(periode.debut).valueOf() : null,
            fin: periode.fin ? moment(periode.fin).valueOf() : null,
            codeRegion: _.get(regions, 'selected.codeRegion', null),
        };
    };

    isFormLoading = () => {
        let { regions } = this.state;
        return regions.loading;
    };

    isFormSynchronizedWithQuery = () => {
        let data = _(this.getFormParameters()).omitBy(_.isNil).value();
        return this.isFormLoading() || _.isEqual(data, this.getFormParametersFromQuery());
    };

    updatePeriode = periode => {
        return new Promise(resolve => {
            this.setState({
                periode: Object.assign({}, periode),
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
                    selected
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
            regions: {
                selected: null,
                ..._.pick(this.state.regions, ['results', 'loading']),
            },
        });
    };

    render() {

        let { periode, regions } = this.state;
        let formSynchronizedWithQuery = this.isFormSynchronizedWithQuery();
        let { theme } = this.context;

        return (
            <Form>
                <div className="form-row">
                    <div className="form-group offset-lg-2 col-lg-4">
                        <label>Regions</label>
                        <Select
                            value={regions.selected}
                            options={regions.results}
                            loading={regions.loading}
                            optionKey="codeRegion"
                            label={option => option.nom}
                            placeholder={'Toutes les régions'}
                            trackingId="Regions"
                            onChange={option => {
                                return this.updateSelectBox('regions', option);
                            }}
                        />
                    </div>
                    <div className="form-group col-lg-4">
                        <label>Période</label>
                        <Periode
                            periode={periode}
                            min={moment('2019-07-01T00:00:00Z').toDate()}
                            max={moment().subtract(1, 'days').toDate()}
                            onChange={periode => this.updatePeriode(periode)}
                        />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group offset-lg-3 col-lg-6 offset-xl-3 col-xl-6 text-center">
                        <Button size="small" onClick={this.resetForm} className="mr-3">
                            <i className="fas fa-times mr-2"></i>
                            Réinitialiser les filtres
                        </Button>
                        <Button
                            size="large"
                            color={theme.buttonColor}
                            onClick={() => this.props.onSubmit(this.getFormParameters())}
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
