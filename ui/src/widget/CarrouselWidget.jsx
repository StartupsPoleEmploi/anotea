import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Score from './components/Score';
import Notes from './components/Notes';
import Verified from './components/Verified';
import Propulsed from './components/Propulsed';
import Header from './components/Header';
import Avis from './components/Avis';
import Button from '../common/components/Button';
import './CarrouselWidget.scss';

const ITEMS_PAR_PAGE = 1;

export default class CarrouselWidget extends Component {

    static propTypes = {
        score: PropTypes.object.isRequired,
        results: PropTypes.object.isRequired,
        fetchAvis: PropTypes.func.isRequired,
    };

    componentDidMount() {
        this.props.fetchAvis({ page: 0, items_par_page: ITEMS_PAR_PAGE });
    }

    previous = () => {
        this.props.fetchAvis({ page: this.props.results.meta.pagination.page - 1, items_par_page: ITEMS_PAR_PAGE });
    };

    next = () => {
        this.props.fetchAvis({ page: this.props.results.meta.pagination.page + 1, items_par_page: ITEMS_PAR_PAGE });
    };

    getCarrousel = () => {

        let current = this.props.results.avis[0];
        let { results } = this.props;
        let { pagination } = results.meta;

        if (pagination.total_items === 0) {
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
                        <span>{pagination.total_items} commentaires</span>
                    </div>

                    {pagination.total_items > 1 &&
                    <div className="pagination d-flex justify-content-between">
                        <Button
                            size="medium"
                            className={`nav ${pagination.page === 0 ? 'invisible' : 'visible'} btn`}
                            onClick={() => this.previous()}>
                            Précédent
                        </Button>

                        <Button
                            size="medium"
                            className={`nav ${pagination.page === pagination.total_pages - 1 ? 'invisible' : 'visible'} btn`}
                            onClick={() => this.next()}>
                            Suivant
                        </Button>

                    </div>
                    }

                    <Avis avis={current} />

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
