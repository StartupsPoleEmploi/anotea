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
                            {/* Section des statistiques sur les stagiaires */}
                            <dl className="row mb-5">
                                <dt className="col-12">Statistiques sur les stagiaires :</dt>
                                <dd className="col-12">
                                    <StagiairesStats query={query} stats={results.stats} store={store} />
                                </dd>
                            </dl>
    
                            <dl className="row mb-5">
                                <dt className="col-sm-12 col-md-3">Statistiques sur les avis :</dt>
                                <dd className="col-sm-12 col-md-9">
                                    <AvisStats query={query} stats={results.stats} store={store} />
                                </dd>
                            </dl>
    
                            <dl className="row mb-5">
                                <dt className="col-sm-12 col-md-3">Statistiques sur les formations :</dt>
                                <dd className="col-sm-12 col-md-9">
                                    <FormationStats query={query} stats={results.stats} store={store} />
                                </dd>
                            </dl>
    
                            {this.mustShowAdminStats() && (
                                <dl className="row mb-5">
                                    <dt className="col-sm-12 col-md-3">Statistiques d'administration :</dt>
                                    <dd className="col-sm-12 col-md-3">
                                        <ModerationStats query={query} stats={results.stats} />
                                    </dd>
                                    <dd className="col-sm-12 col-md-6">
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
