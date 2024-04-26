import React from 'react';
import PropTypes from 'prop-types';
import Page from '../common/page/Page';
import StatsPanel from './components/StatsPanel';
import StatsForm from './components/StatsForm';
import { promiseAll } from '../../utils/async-utils';
import { getRegions } from '../../services/regionsService';

export default class StatsPage extends React.Component {

    static propTypes = {
        router: PropTypes.object.isRequired,
    };

    constructor() {
        super();
        this.state = {
            form: {},
            store: {
                regions: [],
                loading: true,
            }
        };
    }

    async componentDidMount() {
        this.setState({
            store: await this.loadStore()
        });
    }

    loadStore = () => {
        return promiseAll({
            regions: getRegions(),
            loading: false,
        });
    };

    onSubmit = form => {
        this.setState({ form }, () => {
            this.props.router.refreshCurrentPage({
                ...this.state.form,
            });
        });
    };

    render() {
        let { router } = this.props;
        let query = router.getQuery();

        return (
            <Page
                className="StatsPage"
                title="Statistique nationale et régionale"
                form={<StatsForm query={query} store={this.state.store} onSubmit={this.onSubmit} />}
                panel={<StatsPanel query={query} store={this.state.store} />}
            />
        );
    }
}
