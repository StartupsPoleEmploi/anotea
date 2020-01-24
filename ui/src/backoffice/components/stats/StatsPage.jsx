import React from 'react';
import PropTypes from 'prop-types';
import Page from '../common/page/Page';
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
        let query = router.getQuery();

        return (
            <Page
                className="StatsPage"
                form={<StatsForm query={query} onSubmit={this.onSubmit} />}
                panel={<StatsPanel query={query} onFilterClicked={this.onFilterClicked} />}
            />
        );
    }
}
