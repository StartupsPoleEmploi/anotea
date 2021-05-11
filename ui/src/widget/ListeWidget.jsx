import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Score from './components/Score';
import Notes from './components/Notes';
import Verified from './components/Verified';
import Propulsed from './components/Propulsed';
import Header from './components/Header';
import Avis from './components/Avis';
import './ListeWidget.scss';
import Button from '../common/components/Button';
import WidgetContext from './WidgetContext';
import SansAvis from './components/SansAvis';

const ITEMS_PAR_PAGE = 2;

export default class ListeWidget extends Component {

    static contextType = WidgetContext;

    static propTypes = {
        score: PropTypes.object.isRequired,
        results: PropTypes.object.isRequired,
        fetchAvis: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            tri: 'date',
            ordre: 'desc',
        };
    }

    componentDidMount() {
        this.props.fetchAvis({ page: 0, items_par_page: ITEMS_PAR_PAGE });
    }

    page = page => {
        this.props.fetchAvis({
            page: page,
            items_par_page: ITEMS_PAR_PAGE,
            ...this.state,
        });
    };

    sort = () => {
        this.props.fetchAvis({
            page: this.props.results.meta.pagination.page,
            items_par_page: ITEMS_PAR_PAGE,
            ...this.state,
        });
    };

    getListe() {
        let { avis, meta } = this.props.results;

        if (meta.pagination.total_items === 0) {
            return (
                <div className="Liste empty">
                    Il n&apos;y a pas de commentaire sur cette formation pour le moment.
                </div>
            );
        }

        return (
            <div className="Liste">
                <div className="d-flex flex-column">
                    {
                        avis.map(current => {
                            return (
                                <div key={current.id} className="mb-3">
                                    <Avis avis={current} highlight={this.state.tri} />
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        );
    }

    render() {
        let context = this.context;
        let { score, results } = this.props;
        let { pagination } = results.meta;

        if (score.nb_avis === 0) {
            if (context['show-if-0-reviews'] === 'true') {
                return <SansAvis></SansAvis>;
            } else {
                return <div></div>;
            }
              
        }

        return (
            <div className="ListeWidget">

                <div className="row my-3">
                    <div className="col-sm-6">
                        <div className="line d-flex flex-column justify-content-center align-items-center">
                            <Header />
                            <Verified className="mb-2" />
                        </div>
                        <Score score={score} className="mb-3" />
                        <Notes notes={score.notes} />
                        <div className="d-none d-sm-block">
                            <div className="d-flex justify-content-center mt-3">
                                <Propulsed />
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="line d-flex align-items-between flex-wrap justify-content-around flex-sm-nowrap justify-content-sm-between">
                            <div className="pagination d-flex justify-content-between align-items-center my-1 my-sm-0">
                                <div className="summary">
                                    {pagination.total_items} commentaires
                                </div>
                            </div>
                            <div className="pagination d-flex justify-content-between align-items-center my-1 my-sm-0">
                                {pagination.total_items > 1 &&
                                <Button
                                    size="medium"
                                    className="mr-1 btn"
                                    disabled={pagination.page === 0}
                                    onClick={() => this.page(0)}>
                                    <div className="first">
                                        <i className="fas fa-chevron-left"></i>
                                        <i className="fas fa-chevron-left"></i>
                                    </div>
                                </Button>
                                }
                                {pagination.total_items > 1 &&
                                <Button
                                    className="btn"
                                    size="medium"
                                    disabled={pagination.page === 0}
                                    onClick={() => this.page(pagination.page - 1)}>
                                    <i className="fas fa-chevron-left"></i>
                                </Button>
                                }

                                <div className="summary">
                                    <span className="d-none d-sm-block">Page</span>
                                    {pagination.page + 1}/{pagination.total_pages}
                                </div>

                                {pagination.total_items > 1 &&
                                <Button
                                    size="medium"
                                    className="btn"
                                    disabled={pagination.page === pagination.total_pages - 1}
                                    onClick={() => this.page(pagination.page + 1)}>
                                    <i className="fas fa-chevron-right"></i>
                                </Button>
                                }
                                {pagination.total_items > 1 &&
                                <Button
                                    size="medium"
                                    className="ml-1 btn"
                                    disabled={pagination.page === pagination.total_pages - 1}
                                    onClick={() => this.page(pagination.total_pages - 1)}>
                                    <div className="last">
                                        <i className="fas fa-chevron-right"></i>
                                        <i className="fas fa-chevron-right"></i>
                                    </div>
                                </Button>
                                }
                            </div>
                        </div>
                        {context.type === 'organisme' &&
                        <div className="line sort d-flex justify-content-between align-items-center">
                            <div className="d-flex justify-content-between">
                                <span className="pr-3">Trier</span>
                                <select value={this.state.tri} onChange={e => {
                                    this.setState({ tri: e.target.value }, () => {
                                        return this.sort();
                                    });
                                }}>
                                    <option value="date">Par date</option>
                                    <option value="notes">Par notes</option>
                                    <option value="formation">Par formation</option>
                                </select>
                            </div>
                            <div className="d-flex justify-content-between">
                                <button
                                    className={`mr-3 ${this.state.ordre === 'asc' ? 'active' : ''} btn`}
                                    onClick={() => {
                                        this.setState({ ordre: 'asc' }, () => {
                                            return this.sort();
                                        });
                                    }}
                                >
                                    <i className="fas fa-arrow-up"></i>
                                    <span className="d-none d-md-block">Croissant</span>
                                </button>
                                <button
                                    className={`${this.state.ordre === 'asc' ? 'active' : ''} btn`}
                                    onClick={() => {
                                        this.setState({ ordre: 'desc' }, () => {
                                            return this.sort();
                                        });
                                    }}
                                >
                                    <i className="fas fa-arrow-down"></i>
                                    <span className="d-none d-md-block">Décroissant</span>
                                </button>
                            </div>
                        </div>
                        }
                        {this.getListe()}
                        <div className="d-flex justify-content-center mt-3">
                            <div className="d-xs-block d-sm-none">
                                <Propulsed />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
