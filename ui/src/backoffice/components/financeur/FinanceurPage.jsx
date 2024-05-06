import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Page from '../common/page/Page';
import { Tab, Tabs } from '../common/page/tabs/Tabs';
import FinanceurAvisPanel from './components/FinanceurAvisPanel';
import FinanceurAvisChartsPanel from './components/FinanceurAvisChartsPanel';
import FinanceurForm from './components/FinanceurForm';
import { getDepartements } from '../../services/departementsService';
import { getSirens } from '../../services/sirensService';
import { getDispositifs, getFinanceurs } from '../../services/financeursService';
import { getRegions } from '../../services/regionsService';
import { getFormations } from '../../services/formationsService';
import { promiseAll } from '../../utils/async-utils';

export default class FinanceurPage extends React.Component {

    static propTypes = {
        router: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            form: {},
            store: {
                departements: [],
                sirens: [],
                financeurs: [],
                dispositifs: [],
                regions: [],
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
        let query = router.getQuery();

        return promiseAll({
            departements: getDepartements(),
            sirens: getSirens(),
            dispositifs: getDispositifs(),
            financeurs: getFinanceurs(),
            regions: getRegions(),
            formations: query.siren ? getFormations({ organisme: query.siren }) : Promise.resolve([]),
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
        return _.pick(query, ['debut', 'departement', 'fin', 'numeroFormation', 'siren', 'codeFinanceur', 'dispositifFinancement']);
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
        let isNoTabActive = !router.isActive('/backoffice/financeur/avis/charts') && !router.isActive('/backoffice/financeur/avis/liste');

        return (
            <Page
                title="Avis stagiaires"
                form={
                    <FinanceurForm
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
                            isActive={() => isNoTabActive || router.isActive('/backoffice/financeur/avis/charts')}
                            onClick={() => this.onTabClicked('/backoffice/financeur/avis/charts')}
                        />
                        <Tab
                            label="Liste des avis"
                            isActive={() => router.isActive('/backoffice/financeur/avis/liste')}
                            onClick={() => this.onTabClicked('/backoffice/financeur/avis/liste', { sortBy: 'date' })}
                        />
                    </Tabs>
                }
                panel={
                    router.isActive('/backoffice/financeur/avis/liste') ?
                        <FinanceurAvisPanel query={query} onFilterClicked={this.onFilterClicked} /> :
                        <FinanceurAvisChartsPanel query={query} store={store} />
                }
            />
        );
    }
}
