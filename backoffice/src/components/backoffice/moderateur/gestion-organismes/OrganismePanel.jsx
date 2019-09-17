import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { searchOrganismes } from './gestionOrganismesService';
import GlobalMessage from '../../common/message/GlobalMessage';
import Loader from '../../common/Loader';
import Panel from '../../common/panel/Panel';
import { Filter, SearchInputFilter, Toolbar } from '../../common/panel/panel/filters/Toolbar';
import Organisme from './components/Organisme';
import Summary from '../../common/panel/panel/summary/Summary';
import Pagination from '../../common/panel/panel/pagination/Pagination';
import ResultDivider from '../../common/panel/panel/results/ResultDivider';
import ExportButton from './components/ExportButton';
import './OrganismePanel.scss';

export default class OrganismePanel extends React.Component {

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
                organismes: [],
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
        if (!_.isEqual(this.props.query, previous.query)) {
            this.search();
        }
    }

    search = (options = {}) => {
        return new Promise(resolve => {
            this.setState({ loading: !options.silent }, async () => {
                let results = await searchOrganismes(this.props.query);
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
                className={'OrganismePanel'}
                header={
                    <div>
                        <h1 className="title">Gestion des organismes</h1>
                    </div>
                }
                filters={
                    <Toolbar>
                        <Filter
                            label="Actifs"
                            onClick={() => onNewQuery({ status: 'active' })}
                            isDisabled={isTabsDisabled}
                            isActive={() => !isTabsDisabled() && query.status === 'active'} />

                        <Filter
                            label="Inactifs"
                            onClick={() => onNewQuery({ status: 'inactive' })}
                            isDisabled={isTabsDisabled}
                            isActive={() => !isTabsDisabled() && query.status === 'inactive'} />

                        <Filter
                            label="Tous"
                            onClick={() => onNewQuery({ status: 'all' })}
                            isDisabled={isTabsDisabled}
                            isActive={() => !isTabsDisabled() && query.status === 'all'} />

                        <SearchInputFilter
                            label="Rechercher un organisme"
                            onSubmit={search => onNewQuery({ search })}
                            isActive={active => this.setState({ tabsDisabled: active })} />
                    </Toolbar>
                }
                summary={
                    this.state.loading ? <div /> :
                        <Summary paginationLabel="organisme(s)" pagination={results.meta.pagination} />
                }
                results={
                    this.state.loading ?
                        <div className="d-flex justify-content-center"><Loader /></div> :
                        <div>
                            {this.state.message &&
                            <GlobalMessage
                                message={this.state.message}
                                onClose={() => {
                                    return this.setState({ message: null });
                                }} />
                            }
                            <ExportButton status={this.props.query.status}></ExportButton>
                            {
                                <div className="row">
                                    <div className="col-sm-3 offset-md-1">
                                        <p className="column-title d-none d-sm-block">Nom et SIRET</p>
                                    </div>

                                    <div className="col-2">
                                        <p className="column-title d-none d-sm-block">Statut</p>
                                    </div>

                                    <div className="col-1">
                                        <p className="column-title d-none d-sm-block">Avis</p>
                                    </div>

                                    <div className="col-xs-8 col-sm-4 col-md-3">
                                        <p className="column-title d-none d-sm-block">Contact</p>
                                    </div>

                                    <div className="col-sm-2 col-md-1">
                                        <p className="column-title d-none d-sm-block">&nbsp;</p>
                                    </div>
                                </div>
                            }
                            {
                                results.organismes.map(organisme => {
                                    return (
                                        <div key={organisme._id}>
                                            <Organisme
                                                organisme={organisme}
                                                onChange={(avis, options = {}) => {
                                                    let { message } = options;
                                                    if (message) {
                                                        this.setState({ message: message });
                                                    }
                                                    return this.search({ silent: true });
                                                }} />
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
