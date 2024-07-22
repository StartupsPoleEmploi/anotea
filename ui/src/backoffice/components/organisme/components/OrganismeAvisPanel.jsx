import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import Button from '../../../../common/components/Button';
import Loader from '../../../../common/components/Loader';
import { getAvisStats, getExportAvisUrl, searchAvis } from '../../../services/avisService';
import Avis from '../../common/avis/Avis';
import { ReconciliationWorkflow, Workflow } from '../../common/avis/Workflow';
import Filter from '../../common/page/panel/filters/Filter';
import { Filters } from '../../common/page/panel/filters/Filters';
import Pagination from '../../common/page/panel/pagination/Pagination';
import PaginationSummary from '../../common/page/panel/pagination/PaginationSummary';
import Panel from '../../common/page/panel/Panel';
import AvisResults from '../../common/page/panel/results/AvisResults';
import BackofficeContext from '../../../BackofficeContext';

export default class OrganismeAvisPanel extends React.Component {

    static contextType = BackofficeContext;

    static propTypes = {
        query: PropTypes.object.isRequired,
        onFilterClicked: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            message: null,
            loading: false,
            stats: {},
            results: {
                avis: [],
                meta: {
                    stats: {},
                    pagination: {
                        itemsOnThisPage: 0,
                        itemsPerPage: 0,
                        page: 0,
                        totalItems: 0,
                        totalPages: 0,
                    }
                }
            },
        };
    }

    componentDidMount() {
        this.search();
        this.fetchStats();
    }

    componentDidUpdate(previous) {
        if (!_.isEqual(this.props.query, previous.query)) {
            this.search();
            this.fetchStats();
        }
    }

    search = (options = {}) => {
        return new Promise(resolve => {
            this.setState({ loading: !options.silent }, async () => {
                let results = await searchAvis(this.props.query);
                this.setState({ results, loading: false }, () => resolve());
            });
        });
    };

    fetchStats = async () => {
        return new Promise(async resolve => {
            let query = _.pick(this.props.query, ['departement', 'numeroFormation', 'debut', 'fin', 'siren']);
            let stats = await getAvisStats(query);
            this.setState({ stats }, () => resolve());
        });
    };

    render() {

        let { stats, results, message } = this.state;
        let { query, onFilterClicked } = this.props;

        const formateur = this.context.account.nbAvisSirenFormateur && this.context.account.nbAvisSirenFormateur > 0;
        const responsableSansEtreFormateur = this.context.account.nbAvisResponsablePasFormateur && this.context.account.nbAvisResponsablePasFormateur > 0;
        
        return (
            <Panel
                filters={
                    <Filters>
                        {formateur && <Filter
                            label="Nouveaux"
                            isActive={() => query.read === 'false'}
                            getNbElements={() => stats.total - stats.nbRead}
                            onClick={() => onFilterClicked({
                                dispensateur: 'true',
                                responsable: 'false',
                                read: false, sortBy: 'date'
                            })} />}
                        
                        {formateur && <Filter
                            label="Signalés"
                            isActive={() => query.statuses === 'reported'}
                            onClick={() => onFilterClicked({
                                dispensateur: 'true',
                                responsable: 'false',
                                statuses: 'reported', sortBy: 'lastStatusUpdate'
                            })}
                        />}
                        
                        {formateur && <Filter
                            label="Répondus"
                            isActive={() => query.reponseStatuses === 'none,validated'}
                            onClick={() => onFilterClicked({
                                dispensateur: 'true',
                                responsable: 'false',
                                reponseStatuses: 'none,validated',
                                sortBy: 'reponse.lastStatusUpdate'
                            })}
                        />}

                        {formateur && <Filter
                            label="Réponses rejetées"
                            isActive={() => query.reponseStatuses === 'rejected'}
                            onClick={() => onFilterClicked({
                                dispensateur: 'true',
                                responsable: 'false',
                                reponseStatuses: 'rejected',
                                sortBy: 'reponse.lastStatusUpdate'
                            })}
                        />}

                        {responsableSansEtreFormateur && <Filter
                            label="Organismes dispensateurs"
                            isActive={() => query.dispensateur === 'false' && query.responsable === 'true'}
                            isTooltipResponsable={() => true}
                            onClick={() => onFilterClicked({
                                dispensateur: 'false',
                                responsable: 'true',
                                sortBy: 'date'
                            })}
                        />}

                        <Filter
                            label="Tous"
                            isActive={() => !query.read && !query.reponseStatuses && !query.reported && query.dispensateur !== 'false' && query.responsable !== 'false' }
                            onClick={() => onFilterClicked({
                                dispensateur: 'true',
                                responsable: 'true',
                                sortBy: 'date'
                            })} />

                    </Filters>
                }
                summary={
                    <PaginationSummary
                        paginationLabel="avis"
                        pagination={results.meta.pagination}
                        buttons={
                            <Button
                                size="medium"
                                onClick={() => window.open(getExportAvisUrl(_.omit(query, ['page'])))}>
                                <i className="fas fa-download pr-2"></i>Exporter
                            </Button>
                        }
                    />}
                results={
                    this.state.loading ?
                        <Loader centered={true} /> :
                        <AvisResults
                            results={results}
                            message={message}
                            renderAvis={(avis, index) => {
                                const compteConnecteEstLeSirenFormateur = avis.formation.action.organisme_formateur.siret && this.context.account.siret &&
                                    avis.formation.action.organisme_formateur.siret.substring(0, 9) === this.context.account.siret.substring(0, 9);
                                return <Avis
                                    avis={avis}
									index={index}
                                    showReponse={compteConnecteEstLeSirenFormateur}
                                    showReponseButtons={compteConnecteEstLeSirenFormateur}
                                    renderWorkflow={avis => {
                                        return query.statuses === 'reported' ?
                                            <Workflow avis={avis} /> :
                                            <ReconciliationWorkflow avis={avis} />;
                                    }}
                                    onChange={() => {
                                        return Promise.all([
                                            this.search({ silent: true }),
                                            this.fetchStats(),
                                        ]);
                                    }}
                                />;
                            }} />
                }
                pagination={
                    <Pagination
                        pagination={results.meta.pagination}
                        onClick={page => onFilterClicked({ ...query, page })} />}
            />
        );

    }

}
