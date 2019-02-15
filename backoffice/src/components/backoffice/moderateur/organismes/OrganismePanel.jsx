import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { searchOrganismes } from '../service/gestionOrganismesService';
import Message from '../../common/Message';
import Loader from '../../common/Loader';
import Panel from '../../common/panel/Panel';
import Toolbar from '../../common/panel/Toolbar';
import Tab from '../../common/panel/Tab';
import SearchInputTab from '../../common/panel/SearchInputTab';
import Organisme from './components/Organisme';
import Summary from '../../common/panel/Summary';
import { Pagination } from '../../common/panel/Pagination';

export default class OrganismePanel extends React.Component {

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
                organismes: [],
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
                let results = await searchOrganismes(this.props.query);
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
                        <h1 className="title">Gestion des organismes</h1>
                    </div>
                }
                toolbar={
                    <Toolbar>
                        <Tab
                            label="Actifs"
                            onClick={() => onNewQuery({ activated: true })}
                            isDisabled={isTabsDisabled}
                            isActive={() => !isTabsDisabled() && query.activated === 'true'} />

                        <Tab
                            label="Inactifs"
                            onClick={() => onNewQuery({ activated: false })}
                            isDisabled={isTabsDisabled}
                            isActive={() => !isTabsDisabled() && query.activated === 'false'} />

                        <Tab
                            label="Tous"
                            onClick={() => onNewQuery({})}
                            isDisabled={isTabsDisabled}
                            isActive={() => query.activated === undefined} />

                        <SearchInputTab
                            label="Rechercher un organisme"
                            onSubmit={siret => onNewQuery({ siret })}
                            isActive={active => this.setState({ tabsDisabled: active })} />
                    </Toolbar>
                }
                summary={
                    <Summary
                        pagination={results.meta.pagination}
                        empty="Pas d'organisme pour le moment"
                        title={
                            <div>
                                <span className="name">Organismes</span>
                                <span className="type"> {query.activated ? 'actifs' : 'inactifs'}</span>
                            </div>
                        }>

                    </Summary>
                }
                results={
                    this.state.loading ?
                        <div className="d-flex justify-content-center"><Loader /></div> :
                        <div>
                            {this.state.message &&
                            <Message message={this.state.message} onClose={() => {
                                return this.setState({ message: null });
                            }} />
                            }
                            {
                                results.organismes.map((organisme, key) => {
                                    return (
                                        <Organisme
                                            key={key}
                                            organisme={organisme}
                                            onChange={(avis, options = {}) => {
                                                let { message } = options;
                                                if (message) {
                                                    this.setState({ message });
                                                }
                                                return this.search({
                                                    silent: true, goToTop: !!options.message
                                                });
                                            }} />
                                    );
                                })
                            }
                        </div>

                }
                pagination={
                    !this.state.loading &&
                    <Pagination
                        pagination={results.meta.pagination}
                        onClick={page => onNewQuery(_.merge({}, query, { page }))} />
                }
            />
        );
    }
}
