import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Panel from '../../common/page/panel/Panel';
import { getPublicStats } from '../../../services/statsService';
import EmptyResults from '../../common/page/panel/results/EmptyResults';
import BackofficeContext from '../../../BackofficeContext';
import StagiairesStats from './StagiairesStats';
import AvisStats from './AvisStats';
import FormationStats from './FormationStats';
import OrganismeStats from './OrganismeStats';
import ModerationStats from './ModerationStats';

export default class StatsPanel extends React.Component {

    static contextType = BackofficeContext;

    static propTypes = {
        query: PropTypes.object.isRequired,
        store: PropTypes.object.isRequired,
    };

    constructor() {
        super();
        this.state = {
            results: {},
        };
    }

    componentDidMount() {
        this.fetchStats();
    }

    componentDidUpdate(previous) {
        if (!_.isEqual(this.props.query, previous.query)) {
            this.fetchStats();
        }
    }

    mustShowAdminStats() {
        let { account } = this.context;
        return account.profile === 'admin';
    }

    fetchStats = () => {
        return new Promise(async resolve => {
            let results = await getPublicStats(this.props.query);
            this.setState({ results }, () => resolve());
        });
    };

    render() {
        let { query, store } = this.props;
        let { results } = this.state;

        if (_.isEmpty(results.stats)) {
            return <EmptyResults />;
        }

        return (
            <>
                <Panel
                    className="StatsPanel"
                    results={
                        <div>
                            <span>* National</span>
                            <dl className="row mb-5">
                                <h2 className="col-13">Statistiques sur les stagiaires&nbsp;:</h2>
                                <dd className="col-12">
                                    <StagiairesStats query={query} stats={results.stats} store={store} />
                                </dd>
                            </dl>

                            <dl className="row mb-5">
                                <h2 className="col-sm-12 col-md-12">Statistiques sur les avis&nbsp;:</h2>
                                <dd className="col-sm-12 col-md-12">
                                    <AvisStats query={query} stats={results.stats} store={store} />
                                </dd>
                            </dl>

                            <dl className="row mb-5">
                                <h2 className="col-sm-12 col-md-12">Statistiques sur les formations&nbsp;:</h2>
                                <dd className="col-sm-12 col-md-12">
                                    <FormationStats query={query} stats={results.stats} store={store} />
                                </dd>
                            </dl>

                            {this.mustShowAdminStats() && (
                                <dl className="row mb-5">
                                    <h2 className="col-sm-12 col-md-12">Statistiques d'administration&nbsp;:</h2>
                                    <dd className="col-sm-12 col-md-5">
                                        <ModerationStats query={query} stats={results.stats} />
                                    </dd>
                                    <dd className="col-sm-12 col-md-7">
                                        <OrganismeStats query={query} stats={results.stats} />
                                    </dd>
                                </dl>
                            )}
                        </div>
                    }
                />
            </>
        );
    }

}
