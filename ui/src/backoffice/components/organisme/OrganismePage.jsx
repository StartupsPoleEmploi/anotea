import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Page from '../common/page/Page';
import { Tab, Tabs } from '../common/page/tabs/Tabs';
import BackofficeContext from '../../BackofficeContext';
import OrganismeAvisPanel from './components/OrganismeAvisPanel';
import OrganismeAvisChartsPanel from './components/OrganismeAvisChartsPanel';
import OrganismeForm from './components/OrganismeForm';
import { promiseAll } from '../../utils/async-utils';
import { getDepartements } from '../../services/departementsService';
import { getFormations } from '../../services/formationsService';

export default class OrganismePage extends React.Component {

    static contextType = BackofficeContext;

    static propTypes = {
        router: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            store: {
                departements: [],
                sirens: [],
                formations: [],
                loading: true,
            }
        };
    }

    async componentDidMount() {
        this.setState({
            store: await this.loadStore()
        });
    }

    loadStore = async () => {
        let { router } = this.props;
        let { account } = this.context;
        let query = router.getQuery();

        return promiseAll({
            departements: getDepartements(),
            sirens: [
                { siren: account.siret, name: account.raison_sociale },
                { siren: account.siret.substring(0, 9), name: 'Tous les centres' },
            ],
            formations: getFormations({ organisme: query.siren || account.siret }),
            loading: false,
        });
    };

    loadFormations = async siren => {
        this.setState({
            store: {
                ...this.state.store,
                formations: await getFormations({ organisme: siren }),
            }
        });
    };

    onSubmit = form => {
        this.setState({ form }, () => {
            this.props.router.refreshCurrentPage({
                ...this.state.form,
            });
        });
    };

    onTabClicked = path => {
        return this.props.router.goToPage(path, {
            ...this.state.form,
        });
    };

    getQueryFormParameters = () => {
        let query = this.props.router.getQuery();
        return _.pick(query, ['debut', 'departement', 'fin', 'numeroFormation', 'siren']);
    };

    onFilterClicked = parameters => {
        return this.props.router.refreshCurrentPage({
            ...this.getQueryFormParameters(),
            ...parameters,
        });
    };

    render() {
        let { router } = this.props;
        let { store } = this.state;
        let query = router.getQuery();

        return (
            <Page
                loading={this.state.loading}
                form={
                    <OrganismeForm
                        query={query}
                        store={store}
                        loadFormations={this.loadFormations}
                        onSubmit={this.onSubmit}
                    />
                }
                tabs={
                    <Tabs>
                        <Tab
                            label="Vue graphique"
                            isActive={() => router.isActive('/backoffice/organisme/avis/charts')}
                            onClick={() => this.onTabClicked('/backoffice/organisme/avis/charts')} />

                        <Tab
                            label="Liste des avis"
                            isActive={() => router.isActive('/backoffice/organisme/avis/liste')}
                            onClick={() => this.onTabClicked('/backoffice/organisme/avis/liste', {
                                read: false,
                                sortBy: 'date'
                            })} />
                    </Tabs>
                }
                panel={
                    router.isActive('/backoffice/organisme/avis/liste') ?
                        <OrganismeAvisPanel query={router.getQuery()} onFilterClicked={this.onFilterClicked} /> :
                        <OrganismeAvisChartsPanel query={router.getQuery()} />
                }
            />
        );
    }
}
