import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Score from './common/Score';
import Notes from './common/Notes';
import Verified from './common/Verified';
import Propulsed from './common/Propulsed';
import Header from './common/Header';
import Avis from './common/Avis';
import './ListeWidget.scss';
import Button from './common/library/Button';
import WidgetContext from './WidgetContext';

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

    previous = () => {
        this.props.fetchAvis({
            page: this.props.results.meta.pagination.page - 1,
            items_par_page: ITEMS_PAR_PAGE,
            ...this.state,
        });
    };

    next = () => {
        this.props.fetchAvis({
            page: this.props.results.meta.pagination.page + 1,
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
                    Il n'y a pas de commentaire sur cette formation pour le moment.
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
                                    <Avis avis={current} />
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
            return <div></div>;
        }

        return (
            <div className="ListeWidget">

                <div className="row my-3">
                    <div className="col-sm-6">
                        <div className="line d-flex justify-content-center align-items-center">
                            <Header />
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
                        <div className="line d-flex justify-content-between align-items-center">
                            <div className="pagination d-flex justify-content-between align-items-center">
                                {pagination.total_items > 1 &&
                                <Button
                                    size="medium"
                                    disabled={pagination.page === 0}
                                    onClick={() => this.previous()}>
                                    <i className="fas fa-chevron-left"></i>
                                </Button>
                                }

                                <div className="summary">
                                    {pagination.total_items} commentaires
                                </div>

                                {pagination.total_items > 1 &&
                                <Button
                                    size="medium"
                                    disabled={pagination.page === pagination.total_pages - 1}
                                    onClick={() => this.next()}>
                                    <i className="fas fa-chevron-right"></i>
                                </Button>
                                }
                            </div>
                            <Verified />
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
                                    className={`mr-3 ${this.state.ordre === 'asc' ? 'active' : ''}`}
                                    onClick={() => {
                                        this.setState({ ordre: 'asc' }, () => {
                                            return this.sort();
                                        });
                                    }}
                                >
                                    <i className="fas fa-arrow-up"></i> Croissant
                                </button>
                                <button
                                    className={this.state.ordre === 'desc' ? 'active' : ''}
                                    onClick={() => {
                                        this.setState({ ordre: 'desc' }, () => {
                                            return this.sort();
                                        });
                                    }}
                                >
                                    <i className="fas fa-arrow-down"></i> Décroissant
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
