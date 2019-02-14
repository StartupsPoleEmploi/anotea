import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { searchAvis } from '../service/moderationService';
import Loader from '../../common/Loader';
import Panel from '../../common/Panel';
import AvisResultsSummary from './common/summary/AvisResultsSummary';
import AvisResults from './common/AvisResults';
import ToolbarTab from '../common/ToolbarTab';
import SearchInputTab from '../common/SearchInputTab';

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
                this.setState({ results, loading: false }, () => {
                    if (options.goToTop) {
                        window.scrollTo(0, 0);
                    }
                    return resolve();
                });
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
                    <nav className="nav">
                        <ToolbarTab
                            label="À modérer"
                            onClick={() => onNewQuery({ status: 'none', sortBy: 'lastStatusUpdate' })}
                            isActive={() => !isTabsDisabled() && query.status === 'none'}
                            isDisabled={isTabsDisabled}
                            getNbElements={() => _.get(results.meta.stats, 'status.none')} />

                        <ToolbarTab
                            label="Publiés"
                            onClick={() => onNewQuery({ status: 'published', sortBy: 'lastStatusUpdate' })}
                            isDisabled={isTabsDisabled}
                            isActive={() => !isTabsDisabled() && query.status === 'published'} />

                        <ToolbarTab
                            label="Rejetés"
                            onClick={() => onNewQuery({ status: 'rejected', sortBy: 'lastStatusUpdate' })}
                            isDisabled={isTabsDisabled}
                            isActive={() => !isTabsDisabled() && query.status === 'rejected'} />

                        <ToolbarTab
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
                    </nav>
                }
                results={
                    this.state.loading ?
                        <div className="d-flex justify-content-center"><Loader /></div> :
                        <div>
                            <AvisResultsSummary query={query} results={results} />
                            <AvisResults
                                results={results}
                                options={{
                                    showStatus: ['all', 'rejected'].includes(query.status),
                                    showReponse: false,
                                }}
                                refresh={options => this.search({ silent: true, goToTop: !options.keepFocus })}
                                onNewQuery={onNewQuery} />
                        </div>

                }
            />
        );
    }
}
