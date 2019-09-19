import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Score from './common/Score';
import Notes from './common/Notes';
import Verified from './common/Verified';
import Propulsed from './common/Propulsed';
import Header from './common/Header';
import Avis from './common/Avis';
import Option from './common/options/Option';
import './ListeWidget.scss';

export default class ListeWidget extends Component {

    static propTypes = {
        score: PropTypes.object.isRequired,
        results: PropTypes.object.isRequired,
        fetchAvis: PropTypes.func.isRequired,
    };

    componentDidMount() {
        this.goTo(0);
    }

    goTo = async page => {
        this.props.fetchAvis({ page, itemsParPage: 3 });
    };

    getTotalPages = () => {
        return this.props.results.meta.pagination.total_pages;
    };

    getCurrentPage = () => {
        return this.props.results.meta.pagination.page;
    };

    getPagesBefore = () => {
        let array = [];
        if (this.getCurrentPage() - 2 > 0) {
            array.push(1);
            if (this.getCurrentPage() - 2 > 1) {
                array.push('...');
            }
        }

        for (let i = Math.max(this.getCurrentPage() - 2, 0); i < this.getCurrentPage(); i++) {
            array.push(i + 1);
        }
        return array.map(page => {
            return (
                <span
                    className="nav"
                    key={page}
                    onClick={() => this.goTo(page - 1)}>{page}</span>
            );
        });
    };

    getPagesAfter = () => {
        let array = [];
        for (let i = Math.min(this.getCurrentPage() + 2, this.getTotalPages() - 1); i > this.getCurrentPage(); i--) {
            array.push(i + 1);
        }
        array.reverse();
        if (this.getCurrentPage() + 2 < this.getTotalPages() - 1) {
            if (this.getCurrentPage() + 2 < this.getTotalPages() - 2) {
                array.push('...');
            }
            array.push(this.getTotalPages());
        }
        return array.map(page => {
            return (
                <span
                    className="nav"
                    key={page}
                    onClick={() => this.goTo(page - 1)}>{page}</span>
            );
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

                    {this.getTotalPages() > 1 &&
                    <div className="pagination d-flex justify-content-center py-3">
                        {this.getPagesBefore()}
                        <span
                            className={`nav current`}>
                            {this.getCurrentPage() + 1}
                        </span>
                        {this.getPagesAfter()}
                    </div>
                    }
                </div>
            </div>
        );
    }

    render() {
        let { score } = this.props;

        if (score.nb_avis === 0) {
            return <div></div>;
        }

        return (
            <div className="ListeWidget">

                <div className="row my-3">
                    <div className="col-sm-6">
                        <div className="line py-2">
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
                        <div className="line d-flex justify-content-between align-items-center py-2">
                            <div className="summary">
                                {this.props.results.meta.pagination.total_items} commentaires
                            </div>
                            <Verified />
                        </div>
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
