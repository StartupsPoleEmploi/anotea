import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../../../common/components/Button';
import _ from 'lodash';
import { Form, Select } from '../../common/page/form/Form';
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

    onSubmit = () => {
        return this.props.onSubmit({
            ..._.omitBy(this.state, _.isNil),
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
                            <fieldset>
                                <label style={{fontSize: "1.125rem", fontWeight: 700}}>Filtrer par région</label>
                                <Select
                                    placeholder={'Toutes les régions'}
                                    trackingId="Regions"
                                    loading={store.loading}
                                    value={codeRegion}
                                    options={store.regions}
                                    optionKey="codeRegion"
                                    optionLabel="nom"
                                    onChange={(option = {}) => this.setState({ codeRegion: option.codeRegion })}
                                />
                            </fieldset>
                        </div>
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
                </Form>
            </div>
        );
    }
}
