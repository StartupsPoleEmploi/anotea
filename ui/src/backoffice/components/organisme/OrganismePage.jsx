import React from 'react';
import PropTypes from 'prop-types';
import Page from '../common/page/Page';
import { Tab, Tabs } from '../common/page/tabs/Tabs';
import OrganismeAvisPanel from './components/OrganismeAvisPanel';
import OrganismeAvisChartsPanel from './components/OrganismeAvisChartsPanel';
import BackofficeContext from '../../BackofficeContext';
import OrganismeForm from './components/OrganismeForm';

export default class OrganismePage extends React.Component {

    static contextType = BackofficeContext;

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
        let query = router.getQuery();

        return (
            <Page
                loading={this.state.loading}
                form={<OrganismeForm query={query} onSubmit={this.onSubmit} />}
                tabs={
                    <Tabs>
                        <Tab
                            label="Vue graphique"
                            isActive={() => router.isActive('/admin/organisme/avis/charts')}
                            onClick={() => this.onTabClicked('/admin/organisme/avis/charts')} />

                        <Tab
                            label="Liste des avis"
                            isActive={() => router.isActive('/admin/organisme/avis/liste')}
                            onClick={() => this.onTabClicked('/admin/organisme/avis/liste', {
                                read: false,
                                sortBy: 'date'
                            })} />
                    </Tabs>
                }
                panel={
                    router.isActive('/admin/organisme/avis/liste') ?
                        <OrganismeAvisPanel query={router.getQuery()} onFilterClicked={this.onFilterClicked} /> :
                        <OrganismeAvisChartsPanel query={router.getQuery()} />
                }
            />
        );
    }
}
