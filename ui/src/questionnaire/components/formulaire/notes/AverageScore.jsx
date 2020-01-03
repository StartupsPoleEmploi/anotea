import React, { Component } from "react";
import PropTypes from "prop-types";
import "./averageScore.scss";

class AverageScore extends Component {

    static propTypes = {
        score: PropTypes.number.isRequired,
    };

    formattedScore = score => String(score.toFixed(1)).replace(".", ",");

    render() {
        return (
            <div className="average-score">
                <div className="score">
                    <span className="average">
                        {this.props.score ? this.formattedScore(this.props.score) : "-"}
                    </span>
                    <span className="total">/ 5</span>
                    <i className="star fas fa-star" />
                </div>
            </div>
        );
    }
}

export default AverageScore;
