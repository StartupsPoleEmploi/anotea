import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { searchAvis } from '../../../../lib/avisService';
import Loader from '../../common/Loader';
import Panel from '../../common/Panel';
import ReponseResultsSummary from '../common/results/summary/ReponseResultsSummary';
import ToolbarTab from '../common/ToolbarTab';
import AvisResults from '../common/results/AvisResults';
import AvisResultsSummary from '../common/results/summary/AvisResultsSummary';

export default class AvisReponsesPanel extends React.Component {

    static propTypes = {
        codeRegion: PropTypes.string.isRequired,
        query: PropTypes.object.isRequired,
        onNewQuery: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            message: null,
            results: {
                avis: [],
                meta: {
                    stats: {},
                    pagination: {}
                }
            },
        };
    }

    componentDidMount() {
        this.search();
    }

    componentDidUpdate(previous) {
        if (this.props.query !== previous.query) {
            this.search();
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

    render() {
        let { query, onNewQuery } = this.props;
        let results = this.state.results;

        return (
            <Panel
                header={
                    <div>
                        <h1 className="title">Réponses des organimes</h1>
                        <p className="subtitle">
                            Ici, vous trouverez les réponses des organismes de formation adressées aux stagiaires ainsi
                            que les avis signanlés par les organismes.
                        </p>
                    </div>
                }
                toolbar={
                    <nav className="nav">
                        <ToolbarTab
                            label="À modérer"
                            onClick={() => onNewQuery({ reponseStatus: 'none', sortBy: 'reponse.lastStatusUpdate' })}
                            isActive={() => query.reponseStatus === 'none'}
                            getNbElements={() => _.get(results.meta.stats, 'reponseStatus.none')} />

                        <ToolbarTab
                            label="Publiés"
                            onClick={() => onNewQuery({ reponseStatus: 'published', sortBy: 'reponse.lastStatusUpdate' })}
                            isActive={() => query.reponseStatus === 'published'} />

                        <ToolbarTab
                            label="Rejetés"
                            onClick={() => onNewQuery({ reponseStatus: 'rejected', sortBy: 'reponse.lastStatusUpdate' })}
                            isActive={() => query.reponseStatus === 'rejected'} />

                        <ToolbarTab
                            label="Signalés"
                            onClick={() => onNewQuery({ status: 'reported', sortBy: 'lastStatusUpdate' })}
                            isActive={() => query.status === 'reported'}
                            getNbElements={() => _.get(results.meta.stats, 'status.reported')} />

                        <ToolbarTab
                            label="Tous"
                            onClick={() => onNewQuery({ reponseStatus: 'all', sortBy: 'date' })}
                            isActive={() => query.reponseStatus === 'all'} />
                    </nav>
                }
                results={
                    this.state.loading ?
                        <div className="d-flex justify-content-center"><Loader /></div> :
                        <div>
                            {
                                query.status === 'reported' ?
                                    <AvisResultsSummary query={query} results={results} /> :
                                    <ReponseResultsSummary query={query} results={results} />
                            }
                            <AvisResults
                                results={results}
                                refresh={() => this.search({ silent: true })}
                                onNewQuery={onNewQuery}
                                options={{
                                    showStatus: false,
                                    showReponse: query.status !== 'reported',
                                }} />
                        </div>

                }
            />
        );
    }
}
