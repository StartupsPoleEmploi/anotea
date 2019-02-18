import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { searchAvis } from '../service/moderationService';
import Loader from '../../common/Loader';
import Panel from '../../common/panel/Panel';
import ReponseTitle from './components/summary/ReponseTitle';
import Summary from '../../common/panel/Summary';
import { Toolbar, Tab } from '../../common/panel/toolbar/Toolbar';
import AvisResults from './components/AvisResults';
import AvisTitle from './components/summary/AvisTitle';
import { Pagination } from '../../common/panel/Pagination';

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
                    <Toolbar>
                        <Tab
                            label="À modérer"
                            onClick={() => onNewQuery({ reponseStatus: 'none', sortBy: 'reponse.lastStatusUpdate' })}
                            isActive={() => query.reponseStatus === 'none'}
                            getNbElements={() => _.get(results.meta.stats, 'reponseStatus.none')} />

                        <Tab
                            label="Publiés"
                            onClick={() => onNewQuery({
                                reponseStatus: 'published',
                                sortBy: 'reponse.lastStatusUpdate'
                            })}
                            isActive={() => query.reponseStatus === 'published'} />

                        <Tab
                            label="Rejetés"
                            onClick={() => onNewQuery({
                                reponseStatus: 'rejected',
                                sortBy: 'reponse.lastStatusUpdate'
                            })}
                            isActive={() => query.reponseStatus === 'rejected'} />

                        <Tab
                            label="Signalés"
                            onClick={() => onNewQuery({ status: 'reported', sortBy: 'lastStatusUpdate' })}
                            isActive={() => query.status === 'reported'}
                            getNbElements={() => _.get(results.meta.stats, 'status.reported')} />

                        <Tab
                            label="Tous"
                            onClick={() => onNewQuery({ reponseStatus: 'all', sortBy: 'date' })}
                            isActive={() => query.reponseStatus === 'all'} />
                    </Toolbar>
                }
                summary={
                    query.status === 'reported' ?
                        <Summary
                            pagination={results.meta.pagination}
                            empty="Pas d'avis pour le moment"
                            title={<AvisTitle query={query} results={results} />} /> :
                        <Summary
                            pagination={results.meta.pagination}
                            empty="Pas de réponses pour le moment"
                            title={<ReponseTitle query={query} />} />
                }
                results={
                    this.state.loading ?
                        <div className="d-flex justify-content-center"><Loader /></div> :
                        <div>
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
                pagination={
                    this.state.loading ?
                        <div /> :
                        <Pagination
                            pagination={results.meta.pagination}
                            onClick={page => onNewQuery(_.merge({}, query, { page }))} />
                }
            />
        );
    }
}
