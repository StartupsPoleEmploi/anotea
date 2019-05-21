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

export default class CarrouselWidget extends Component {

    static propTypes = {
        score: PropTypes.object.isRequired,
        results: PropTypes.object.isRequired,
    };

    state = {
        index: 0
    };

    previous = () => {
        this.setState({ index: this.state.index - 1 });
    };

    next = async () => {
        this.setState({ index: this.state.index + 1 });
    };


    getCarrousel = () => {

        let current = this.props.results.avis[this.state.index];
        let totalItems = this.props.results.meta.pagination.total_items;

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
                            className={`nav ${this.state.index === 0 ? 'invisible' : 'visible'}`}
                            onClick={() => this.previous()}>
                            <span className="fas fa-chevron-left"></span>
                        </Button>

                        <div className="align-self-center">{this.state.index + 1} sur {totalItems}</div>

                        <Button
                            size="small"
                            className={`nav ${this.state.index >= totalItems - 1 ? 'invisible' : 'visible'}`}
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
