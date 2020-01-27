import React from 'react';
import PropTypes from 'prop-types';
import Page from '../common/page/Page';
import { Tab, Tabs } from '../common/page/tabs/Tabs';
import AppContext from '../../BackofficeContext';
import FinanceurAvisPanel from './components/FinanceurAvisPanel';
import FinanceurAvisChartsPanel from './components/FinanceurAvisChartsPanel';
import FinanceurForm from './components/FinanceurForm';

export default class FinanceurPage extends React.Component {

    static contextType = AppContext;

    static propTypes = {
        router: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
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

    onTabClicked = (path, parameters = {}) => {
        return this.props.router.goToPage(path, {
            ...this.state.form,
            ...parameters
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
        let { form } = this.state;
        let query = router.getQuery();

        return (
            <Page
                loading={this.state.loading}
                form={<FinanceurForm query={query} onSubmit={this.onSubmit} />}
                tabs={
                    <Tabs>
                        <Tab
                            label="Vue graphique"
                            isActive={() => router.isActive('/admin/financeur/avis/charts')}
                            onClick={() => this.onTabClicked('/admin/financeur/avis/charts')} />

                        <Tab
                            label="Liste des avis"
                            isActive={() => router.isActive('/admin/financeur/avis/liste')}
                            onClick={() => this.onTabClicked('/admin/financeur/avis/liste', { sortBy: 'date' })} />
                    </Tabs>
                }
                panel={
                    router.isActive('/admin/financeur/avis/liste') ?
                        <FinanceurAvisPanel query={query} form={form} onFilterClicked={this.onFilterClicked} /> :
                        <FinanceurAvisChartsPanel query={query} form={form} />
                }
            />
        );
    }
}
