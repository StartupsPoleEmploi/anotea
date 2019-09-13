import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { searchAvis } from './moderationService';
import Loader from '../../common/Loader';
import Panel from '../../common/panel/Panel';
import { SearchInputFilter, Filter, Toolbar } from '../../common/panel/filters/Toolbar';
import Summary from '../../common/panel/summary/Summary';
import Pagination from '../../common/panel/pagination/Pagination';
import Avis from '../../common/avis/Avis';
import ResultDivider from '../../common/panel/results/ResultDivider';
import GlobalMessage from '../../common/message/GlobalMessage';

export default class ModerationAvisPanel extends React.Component {

    static propTypes = {
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
                filters={
                    <Toolbar>
                        <Filter
                            label="À modérer"
                            onClick={() => onNewQuery({ status: 'none', sortBy: 'lastStatusUpdate' })}
                            isActive={() => !isTabsDisabled() && query.status === 'none'}
                            isDisabled={isTabsDisabled}
                            getNbElements={() => _.get(results.meta.stats, 'status.none')} />

                        <Filter
                            label="Publiés"
                            onClick={() => onNewQuery({ status: 'published', sortBy: 'lastStatusUpdate' })}
                            isDisabled={isTabsDisabled}
                            isActive={() => !isTabsDisabled() && query.status === 'published'} />

                        <Filter
                            label="Rejetés"
                            onClick={() => onNewQuery({ status: 'rejected', sortBy: 'lastStatusUpdate' })}
                            isDisabled={isTabsDisabled}
                            isActive={() => !isTabsDisabled() && query.status === 'rejected'} />

                        <Filter
                            label="Tous"
                            onClick={() => onNewQuery({ status: 'all', sortBy: 'date' })}
                            isDisabled={isTabsDisabled}
                            isActive={() => query.status === 'all'} />

                        <SearchInputFilter
                            label="Rechercher un avis"
                            isActive={active => this.setState({ tabsDisabled: active })}
                            onSubmit={fulltext => {
                                return onNewQuery({
                                    status: 'all',
                                    fulltext: fulltext,
                                });
                            }} />
                    </Toolbar>
                }
                summary={
                    this.state.loading ? <div /> :
                        <Summary paginationLabel="avis" pagination={results.meta.pagination} />
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
                                                showStatus={['all', 'rejected'].includes(query.status)}
                                                showReponse={false}
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
