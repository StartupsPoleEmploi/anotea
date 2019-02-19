import React from 'react';
import PropTypes from 'prop-types';
import { searchOrganismes } from '../service/gestionOrganismesService';
import Message from '../../common/Message';
import Loader from '../../common/Loader';
import Panel from '../../common/Panel';
import ToolbarTab from '../common/ToolbarTab';
import SearchInputTab from '../common/SearchInputTab';
import OrganismeResults from './OrganismeResults';

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
                        <p className="subtitle">
                            Ici, vous trouverez les réponses des organismes de formation adressées aux stagiaires.
                            Vous pouvez également consulter les informations d&apos;un organisme en effectuant une
                            recherche
                        </p>
                    </div>
                }
                toolbar={
                    <nav className="nav">
                        <ToolbarTab
                            label="Actifs"
                            onClick={() => onNewQuery({ activated: true })}
                            isDisabled={isTabsDisabled}
                            isActive={() => !isTabsDisabled() && query.activated === 'true'} />

                        <ToolbarTab
                            label="Inactifs"
                            onClick={() => onNewQuery({ activated: false })}
                            isDisabled={isTabsDisabled}
                            isActive={() => !isTabsDisabled() && query.activated === 'false'} />

                        <ToolbarTab
                            label="Tous"
                            onClick={() => onNewQuery({})}
                            isDisabled={isTabsDisabled}
                            isActive={() => query.activated === undefined} />

                        <SearchInputTab
                            label="Rechercher un organisme"
                            onSubmit={siret => onNewQuery({ siret })}
                            isActive={active => this.setState({ tabsDisabled: active })} />
                    </nav>
                }
                results={
                    this.state.loading ?
                        <div className="d-flex justify-content-center"><Loader /></div> :
                        <div>
                            {this.state.message &&
                            <Message message={this.state.message} onClose={() => this.setState({ message: null })} />
                            }
                            <OrganismeResults
                                results={results}
                                onNewQuery={onNewQuery}
                                refresh={options => {
                                    let { message } = options;
                                    if (message) {
                                        this.setState({ message });
                                    }
                                    return this.search({ silent: true, goToTop: !!options.message });
                                }} />
                        </div>

                }
            />
        );
    }
}
