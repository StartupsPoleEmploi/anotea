import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import Page from '../common/page/Page';
import './StatsPage.scss';
import StatsPanel from './components/StatsPanel';
import StatsForm from './components/StatsForm';

export default class StatsPage extends React.Component {

    static propTypes = {
        router: PropTypes.object.isRequired,
    };

    constructor() {
        super();
        this.state = {
            form: {},
        };
    }

    onSubmit = form => {
        this.setState({ form }, () => {
            this.props.router.refreshCurrentPage({
                ...this.state.form,
            });
        });

    };

    onFilterClicked = parameters => {
        return this.props.router.refreshCurrentPage({
            ...this.state.form,
            ...parameters,
        });
    };

    render() {
        let { router } = this.props;

        return (
            <Page
                className="StatsPage"
                form={<StatsForm query={router.getQuery()} onSubmit={this.onSubmit} />}
                panel={<StatsPanel query={router.getQuery()} onFilterClicked={this.onFilterClicked} />}
            />
        );
    }
}
