import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../../../common/components/Button';
import _ from 'lodash';
import moment from 'moment';
import { Form, Periode, Select } from '../../common/page/form/Form';
import { getRegions } from '../../../services/regionsService';

export default class StatsForm extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
        onSubmit: PropTypes.func.isRequired,
    };

    constructor() {
        super();
        this.state = {
            periode: {
                startDate: null,
                endDate: null,
            },
            regions: {
                selected: null,
                loading: true,
                results: [],
            },
        };
    }


    getFormParameters = () => {
        let { periode, regions } = this.state;

        return {
            startDate: periode.startDate ? moment(periode.startDate).valueOf() : null,
            endDate: periode.endDate ? moment(periode.endDate).valueOf() : null,
            codeRegion: _.get(regions, 'selected.codeRegion', null),
        };
    };

    async componentDidMount() {

        let { query } = this.props;

        this.loadSelectBox('regions', () => getRegions())
        .then(results => {
            return this.updateSelectBox('regions', results.find(r => r.codeRegion === query.codeRegion));
        });

        this.setState({
            periode: {
                startDate: query.startDate ? moment(parseInt(query.startDate)).toDate() : null,
                endDate: query.endDate ? moment(parseInt(query.endDate)).toDate() : null,
            },
        });
    }

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

    render() {

        let { periode, regions } = this.state;

        return (
            <Form>
                <div className="form-row">
                    <div className="form-group col-lg-6 offset-xl-2 col-xl-5">
                        <label>Regions</label>
                        <Select
                            value={regions.selected}
                            options={regions.results}
                            loading={regions.loading}
                            optionKey="codeRegion"
                            label={option => option.nom}
                            placeholder={'Regions'}
                            trackingId="Regions"
                            onChange={option => {
                                return this.updateSelectBox('regions', option);
                            }}
                        />
                    </div>
                    <div className="form-group col-lg-6 col-xl-3">
                        <label>Période</label>
                        <Periode
                            periode={periode}
                            min={moment('2016-01-01T00:00:00Z').toDate()}
                            onChange={periode => this.updatePeriode(periode)}
                        />
                    </div>
                </div>
                <div className="form-row justify-content-center">
                    <div className="form-group buttons">
                        <Button size="large" color="blue" onClick={() => this.props.onSubmit(this.getFormParameters())}>
                            Rechercher
                        </Button>
                    </div>
                </div>
            </Form>
        );
    }
}
