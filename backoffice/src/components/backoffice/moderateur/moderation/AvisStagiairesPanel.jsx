import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { searchAvis } from './moderationService';
import Loader from '../../common/Loader';
import Panel from '../../common/panel/Panel';
import AvisTitle from './components/summary/AvisTitle';
import { Toolbar, Tab, SearchInputTab } from '../../common/panel/toolbar/Toolbar';
import Summary from '../../common/panel/Summary';
import Pagination from '../../common/panel/Pagination';
import Avis from './components/avis/Avis';
import ResultDivider from '../../common/panel/ResultDivider';
import GlobalMessage from '../../common/message/GlobalMessage';

export default class AvisStagiairesPanel extends React.Component {

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
            tabsDisabled: false,
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

        let isTabsDisabled = () => this.state.tabsDisabled;

        return (
            <Panel
                header={
                    <div>
                        <h1 className="title">Avis et données stagiaires</h1>
                        <p className="subtitle">
                            C&apos;est ici que vous retrouverez tous les avis stagiaire à modérer.
                            Vous pouvez également supprimer ou modifier un avis sur demande d&apos;un stagiaire.
                        </p>
                    </div>
                }
                toolbar={
                    <Toolbar>
                        <Tab
                            label="À modérer"
                            onClick={() => onNewQuery({ status: 'none', sortBy: 'lastStatusUpdate' })}
                            isActive={() => !isTabsDisabled() && query.status === 'none'}
                            isDisabled={isTabsDisabled}
                            getNbElements={() => _.get(results.meta.stats, 'status.none')} />

                        <Tab
                            label="Publiés"
                            onClick={() => onNewQuery({ status: 'published', sortBy: 'lastStatusUpdate' })}
                            isDisabled={isTabsDisabled}
                            isActive={() => !isTabsDisabled() && query.status === 'published'} />

                        <Tab
                            label="Rejetés"
                            onClick={() => onNewQuery({ status: 'rejected', sortBy: 'lastStatusUpdate' })}
                            isDisabled={isTabsDisabled}
                            isActive={() => !isTabsDisabled() && query.status === 'rejected'} />

                        <Tab
                            label="Tous"
                            onClick={() => onNewQuery({ status: 'all', sortBy: 'date' })}
                            isDisabled={isTabsDisabled}
                            isActive={() => query.status === 'all'} />

                        <SearchInputTab
                            label="Rechercher un stagiaire"
                            isActive={active => this.setState({ tabsDisabled: active })}
                            onSubmit={stagiaire => {
                                return onNewQuery({
                                    status: 'all',
                                    stagiaire: stagiaire,
                                });
                            }} />
                    </Toolbar>
                }
                summary={
                    this.state.loading ? <div /> :
                        <Summary
                            paginationLabel="avis"
                            pagination={results.meta.pagination}
                            empty="Pas d'avis pour le moment"
                            title={<AvisTitle query={query} results={results} />} />
                }
                results={
                    this.state.loading ?
                        <div className="d-flex justify-content-center"><Loader /></div> :
                        <div>
                            {this.state.message &&
                            <GlobalMessage
                                message={this.state.message}
                                onClose={() => this.setState({ message: null })} />
                            }
                            {
                                results.avis.map(avis => {
                                    return (
                                        <div key={avis._id}>
                                            <Avis
                                                avis={avis}
                                                options={{
                                                    showStatus: ['all', 'rejected'].includes(query.status),
                                                    showReponse: false,
                                                }}
                                                onChange={(avis, options) => {
                                                    let { message } = options;
                                                    if (message) {
                                                        this.setState({ message });
                                                    }
                                                    return this.search({ silent: true });
                                                }}>
                                            </Avis>
                                            <ResultDivider />
                                        </div>
                                    );
                                })
                            }
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
