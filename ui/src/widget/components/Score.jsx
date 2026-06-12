import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Score.scss';

export default class Score extends Component {

    static propTypes = {
        score: PropTypes.object.isRequired,
        className: PropTypes.string,
    };

    render() {

        let { score, className } = this.props;

        return (
            <div className={`Score d-flex justify-content-center ${className}`}>
                <div className="d-flex flex-column p-2 mb-2">
                    <p className="mb-0">
                        <span className="moyenne">{`${score.notes.global}`.replace('.', ',')}</span>
                        <span className="total" aria-hidden="true">/5</span>
                        <span className="sr-only">sur 5</span>
                        <span className="star fas fa-star" aria-hidden="true"></span>
                    </p>
                    <p className="nb-avis text-center mb-0">{score.nb_avis} notes</p>
                </div>
            </div>
        );
    }
}
