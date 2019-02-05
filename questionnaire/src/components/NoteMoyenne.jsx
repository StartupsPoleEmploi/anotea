import React, { Component } from 'react';

import Stars from './Stars';
import PropTypes from 'prop-types';

import './NoteMoyenne.scss';

class NoteMoyenne extends Component {

    static propTypes = {
        averageScore: PropTypes.number.isRequired
    }

    roundHalf = num => Math.round(num * 2) / 2;

    formattedScore = score => String(score.toFixed(1)).replace('.', ',');

    render() {
        return (
            <div className="note-moyenne">
                <div className="label">
                    <span className="title">Note moyenne</span>
                    <span className="description">Voici la moyenne des notes que vous avez données.</span>
                </div>
                <div className="score">
                    <span className="averageScore">{this.props.averageScore ? this.formattedScore(this.props.averageScore) : '-'}</span><span className="total">/ 5</span>
                </div>
                <Stars value={this.roundHalf(this.props.averageScore)} readonly={true} starsStyle={{ fontSize: '10px' }} />
                <div className="note-details">
                    <span className="label">Détails des notes</span>
                    <span className="arrow"></span>
                </div>
            </div>
        );
    }
}

export default NoteMoyenne;
