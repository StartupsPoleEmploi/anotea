import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Score from './common/Score';
import Notes from './common/Notes';
import Verified from './common/Verified';
import Propulsed from './common/Propulsed';
import Header from './common/Header';
import Avis from './common/Avis';
import Button from './common/library/Button';
import './CarrouselWidget.scss';

const ITEMS_PAR_PAGE = 1;

export default class CarrouselWidget extends Component {

    static propTypes = {
        score: PropTypes.object.isRequired,
        results: PropTypes.object.isRequired,
        fetchAvis: PropTypes.func.isRequired,
    };

    componentDidMount() {
        this.props.fetchAvis(0, ITEMS_PAR_PAGE);
    }

    previous = () => {
        this.props.fetchAvis(this.props.results.meta.pagination.page - 1, ITEMS_PAR_PAGE);
    };

    next = async () => {
        this.props.fetchAvis(this.props.results.meta.pagination.page + 1, ITEMS_PAR_PAGE);
    };

    getCarrousel = () => {

        let current = this.props.results.avis[0];
        let totalItems = this.props.results.meta.pagination.total_items;
        let pagination = this.props.results.meta.pagination;

        if (totalItems === 0) {
            return (
                <div className="carrousel empty d-flex justify-content-center">
                    Il n'y a pas de commentaire sur cette formation pour le moment.
                </div>
            );
        }

        return (
            <div className="carrousel">
                <div className="d-flex flex-column">

                    <div className="summary">
                        <span>{totalItems} commentaires</span>
                    </div>

                    <Avis avis={current} />

                    {totalItems > 1 &&
                    <div className="pagination d-flex justify-content-between py-2">
                        <Button
                            size="small"
                            className={`nav ${pagination.page === 0 ? 'invisible' : 'visible'}`}
                            onClick={() => this.previous()}>
                            <span className="fas fa-chevron-left"></span>
                        </Button>

                        <div className="align-self-center">{pagination.page + 1} sur {totalItems}</div>

                        <Button
                            size="small"
                            className={`nav ${pagination.page >= totalItems - 1 ? 'invisible' : 'visible'}`}
                            onClick={() => this.next()}>
                            <span className="fas fa-chevron-right"></span>
                        </Button>

                    </div>
                    }

                </div>
            </div>
        );
    };

    render() {
        let { score } = this.props;

        if (score.nb_avis === 0) {
            return <div></div>;
        }

        return (
            <div className="CarrouselWidget">

                <div className="row my-3">
                    <div className="col-12">
                        <Header />
                    </div>
                </div>

                <div className="row my-3">
                    <div className="col-12">
                        <Verified />
                    </div>
                </div>

                <div className="row my-3">
                    <div className="col-12">
                        <Score score={score} className="mb-3" />
                        <Notes notes={score.notes} />
                    </div>
                </div>

                <div className="row my-3">
                    <div className="col-12">
                        {this.getCarrousel()}
                    </div>
                </div>


                <div className="row my-3">
                    <div className="col-12 text-center">
                        <Propulsed />
                    </div>
                </div>
            </div>
        );
    }
}
