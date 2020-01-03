import React, { Component } from "react";
import PropTypes from "prop-types";
import "./Score.scss";

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
                    <div>
                        <span className="moyenne">{`${score.notes.global}`.replace(".", ",")}</span>
                        <span className="total">/5</span>
                        <span className="star fas fa-star"></span>
                    </div>
                    <div className="nb-avis text-center">{score.nb_avis} notes</div>
                </div>
            </div>
        );
    }
}
