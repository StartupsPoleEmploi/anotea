import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Stars from './Stars';

import './averageScore.scss';

class AverageScore extends Component {

    static propTypes = {
        score: PropTypes.number.isRequired
    };

    roundHalf = num => Math.round(num * 2) / 2;

    formattedScore = score => String(score.toFixed(1)).replace('.', ',');

    render() {
        return (
            <div className={`average-score`}>
                <div className="score">
                    <span className="averageScore">{this.props.score ? this.formattedScore(this.props.score) : '-'}</span><span className="total">/ 5</span>
                </div>
                <Stars value={this.roundHalf(this.props.score)} readonly={true} starsStyle={{ fontSize: '10px' }} />
            </div>
        );
    }
}

export default AverageScore;
