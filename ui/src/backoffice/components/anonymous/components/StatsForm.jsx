import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../../../common/components/Button';
import _ from 'lodash';
import moment from 'moment';
import { Form, Periode, Select } from '../../common/page/form/Form';
import BackofficeContext from '../../../BackofficeContext';

export default class StatsForm extends React.Component {

    static contextType = BackofficeContext;

    static propTypes = {
        query: PropTypes.object.isRequired,
        store: PropTypes.object.isRequired,
        onSubmit: PropTypes.func.isRequired,
    };

    constructor() {
        super();
        this.state = {
            codeRegion: null,
        };
    }

    initState = () => {
        return {
            debut: null,
            fin: null,
            codeRegion: null,
        };
    };

    componentDidUpdate(previous) {
        if (!_.isEqual(previous.store, this.props.store) && !this.formAlreadyPopulatedFromQuery) {
            let { query, store } = this.props;

            this.setState({
                codeRegion: _.get(store.regions.find(f => f.codeRegion === query.codeRegion), 'codeRegion', null),
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

        let { codeRegion } = this.state;
        let { store } = this.props;
        let formSynchronizedWithQuery = this.isFormSynchronizedWithQuery();
        let { theme } = this.context;

        return (
            <div className="d-flex justify-content-center">
                <Form className="a-width-50">
                    <div className="d-flex justify-content-between align-items-end">
                        <div className="flex-grow-1 mr-2">
                            <label htmlFor="choix-region" style={{fontSize: "1.125rem", fontWeight: 700}}>Filtrer par région</label>
                            <Select
                                id="choix-region"
                                placeholder={'Toutes les régions'}
                                trackingId="Regions"
                                loading={store.loading}
                                value={codeRegion}
                                options={store.regions}
                                optionKey="codeRegion"
                                optionLabel="nom"
                                onChange={(option) => this.setState({ codeRegion: option ? option.codeRegion : null })}
                            />
                            <fieldset>
                                <legend>Période</legend>
                                <Periode
                                    periode={{ debut: this.state.debut, fin: this.state.fin }}
                                    min={moment('2019-08-01').toDate()}
                                    max={moment().toDate()}
                                    onChange={({ debut, fin }) => this.setState({ debut, fin })}
                                />
                            </fieldset>
                        </div>
                    </div>

                    <div className="form-row justify-content-center" style={{marginTop: "20px"}}>
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
                                    color={theme.buttonColor}
                                    disabled={store.loading}
                                    onClick={() => this.onSubmit()}
                                    style={formSynchronizedWithQuery ? {} : { border: '2px solid' }}
                                >
                                    {!formSynchronizedWithQuery && <i className="fas fa-sync a-icon"></i>}
                                    Rechercher
                                </Button>
                            </div>
                        </div>
                </Form>
            </div>
        );
    }
}
