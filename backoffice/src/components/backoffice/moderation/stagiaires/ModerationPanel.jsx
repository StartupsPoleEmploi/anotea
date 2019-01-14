import React from 'react';
import PropTypes from 'prop-types';
import { loadAvis, loadInventory } from '../../../../lib/avisService';
import Filters from './Filters';
import Loader from '../../common/Loader';
import Panel from '../../common/Panel';
import Results from './Results';

const DEFAULT_FILTER_NAME = 'all';

export default class ModerationPanel extends React.Component {

    static propTypes = {
        codeRegion: PropTypes.string.isRequired,
        location: PropTypes.object.isRequired,
        match: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            filter: DEFAULT_FILTER_NAME,
            loading: false,
            inventory: {},
            results: {
                avis: [],
                page: props.match.params.page || 0,
                pageCount: 0,
                elementsPerPage: 0,
                elementsOnThisPage: 0,
            },
        };
    }

    componentDidMount() {
        let params = this.props.match.params;
        this.search({
            page: params.page || 0,
            filter: params.filter || DEFAULT_FILTER_NAME,
        });
    }

    componentDidUpdate(prevProps) {
        let params = this.props.match.params;
        if (this.props.location !== prevProps.location) {
            this.search({
                page: params.page || 0,
                filter: params.filter || DEFAULT_FILTER_NAME,
            });
        }
    }

    search = (options = {}) => {
        return new Promise(resolve => {
            this.setState(!options.silent ? { loading: true, inventory: {} } : {}, async () => {
                let filter = options.filter || this.state.filter;
                let page = options.page !== undefined ? options.page : this.state.results.page;

                let [inventory, results] = await Promise.all([
                    loadInventory(this.props.codeRegion), //FIXME return inventory and pagination as a meta data of avis results
                    loadAvis(filter, 'creation', this.props.codeRegion, page),
                ]);

                this.setState({ results, inventory, filter, loading: false }, () => resolve());
            });
        });
    };

    render() {
        return (
            <Panel
                header={
                    <div>
                        <h1 className="title">Avis et données stagiaires</h1>
                        <p className="subtitle">
                            C'est ici que vous retrouverez tous les avis stagiaire à modérer.
                            Vous pouvez également supprimer ou modifier un avis sur demande d'un stagiaire.
                        </p>
                    </div>}
                filters={
                    <Filters current={this.state.filter} inventory={this.state.inventory} />
                }
                results={
                    this.state.loading ?
                        <div className="mx-auto" style={{ width: '200px' }}><Loader /></div> :
                        <Results
                            results={this.state.results}
                            filter={this.state.filter}
                            onChange={() => this.search({ silent: true })} />

                }
            />
        );
    }
}
