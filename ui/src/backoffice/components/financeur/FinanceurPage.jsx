import React from 'react';
import PropTypes from 'prop-types';
import Page from '../common/page/Page';
import { Tab, Tabs } from '../common/page/tabs/Tabs';
import FinanceurContext from './FinanceurContext';
import FinanceurAvisPanel from './components/FinanceurAvisPanel';
import FinanceurAvisChartsPanel from './components/FinanceurAvisChartsPanel';
import FinanceurForm from './components/FinanceurForm';
import { getDepartements } from '../../services/departementsService';
import { getSirens } from '../../services/sirensService';
import { getFinanceurs } from '../../services/financeursService';
import { getRegions } from '../../services/regionsService';
import { getFormations } from '../../services/formationsService';
import BackofficeContext from '../../BackofficeContext';
import { promiseAll } from '../../utils/async-utils';


export default class FinanceurPage extends React.Component {

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
            dispositifs: getSirens(),
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

    createFinanceurContext = () => {
        return {
            ...this.context,
            store: this.state.store,
            actions: { loadFormations: this.loadFormations }
        };
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

    onFilterClicked = parameters => {
        return this.props.router.refreshCurrentPage({
            ...(this.state.form || this.props.router.getQuery()),
            ...parameters,
        });
    };

    render() {
        let { router } = this.props;
        let query = router.getQuery();

        return (
            <FinanceurContext.Provider value={this.createFinanceurContext()}>
                <Page
                    form={<FinanceurForm query={query} onSubmit={this.onSubmit} />}
                    tabs={
                        <Tabs>
                            <Tab
                                label="Vue graphique"
                                isActive={() => router.isActive('/backoffice/financeur/avis/charts')}
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
                            <FinanceurAvisChartsPanel query={query} />
                    }
                />
            </FinanceurContext.Provider>
        );
    }
}
