import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { searchAvis } from '../../../../lib/avisService';
import Toolbar from './Toolbar';
import Loader from '../../common/Loader';
import Panel from '../../common/Panel';
import Summary from './Summary';
import { Pagination } from '../../common/Pagination';
import Avis from './avis/Avis';
import Message from '../../common/Message';

class StagiairesPanel extends React.Component {

    static propTypes = {
        codeRegion: PropTypes.string.isRequired,
        parameters: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            message: null,
            results: {
                avis: [],
                meta: {
                    inventory: {
                        reported: 0,
                        toModerate: 0,
                        rejected: 0,
                        published: 0,
                        all: 0,
                    },
                    pagination: {
                        page: 0,
                        itemsPerPage: 0,
                        itemsOnThisPage: 0,
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
        if (this.props.parameters !== previous.parameters) {
            this.search();
        }
    }

    search = (options = {}) => {
        return new Promise(resolve => {
            this.setState({ loading: !options.silent }, async () => {
                let results = await searchAvis(this.props.parameters);
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
        let parameters = this.props.parameters;

        return (
            <Panel
                header={
                    <div>
                        <h1 className="title">Avis et données stagiaires</h1>
                        <p className="subtitle">
                            C&apos;est ici que vous retrouverez tous les avis stagiaire à modérer.
                            Vous pouvez également supprimer ou modifier un avis sur demande d&apos;un stagiaire.
                        </p>
                    </div>}
                toolbar={
                    <Toolbar
                        parameters={parameters}
                        inventory={this.state.results.meta.inventory}
                        onChange={this.props.onChange}
                    />
                }
                results={
                    this.state.loading ?
                        <div className="d-flex justify-content-center"><Loader /></div> :
                        <div>
                            <Summary parameters={parameters} results={this.state.results} />
                            {this.state.message &&
                            <Message message={this.state.message} onClose={() => this.setState({ message: null })} />
                            }
                            {
                                this.state.results.avis
                                .map((avis, key) => {
                                    return (
                                        <div key={key} className="row">
                                            <div className="col-sm-12">
                                                <Avis
                                                    avis={avis}
                                                    showStatus={parameters.filter === 'all'}
                                                    onChange={(avis, options = {}) => {
                                                        let { message } = options;
                                                        if (message) {
                                                            this.setState({ message });
                                                        }
                                                        this.search({ silent: true, goToTop: !!message });
                                                    }}>
                                                </Avis>
                                            </div>
                                        </div>
                                    );
                                })
                            }
                            {this.state.results.meta.pagination.totalPages > 1 &&
                            <div className="row justify-content-center">
                                <div className="col-4 d-flex justify-content-center">
                                    <Pagination
                                        pagination={this.state.results.meta.pagination}
                                        onClick={page => {
                                            this.props.onChange({
                                                filter: parameters.filter,
                                                query: parameters.query,
                                                page,
                                            });
                                        }} />
                                </div>
                            </div>
                            }
                        </div>

                }
            />
        );
    }
}

export default withRouter(StagiairesPanel);
