import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import "./formation.scss";

class Formation extends Component {

    static propTypes = {
        stagiaire: PropTypes.object
    };

    render() {
        let startDate = moment(this.props.stagiaire.training.startDate).format("DD/MM/YYYY");
        let scheduledEndDate = moment(this.props.stagiaire.training.scheduledEndDate).format("DD/MM/YYYY");
        return (
            <div className="formation">
                <div className="row pb-5">
                    <div className="col-sm-12 offset-lg-2 col-lg-8 offset-xl-3 col-xl-6">
                        {this.props.stagiaire &&
                        <div>
                            <h1>Évaluez votre formation</h1>
                            <div>
                                <div className="description">
                                    <span className="title">{this.props.stagiaire.training.title}</span>
                                    <span>&nbsp;| {startDate} au {scheduledEndDate}</span>
                                    <div>
                                        {this.props.stagiaire.training.organisation.name}
                                        &nbsp;-&nbsp;
                                        {this.props.stagiaire.training.place.city}
                                    </div>
                                </div>
                            </div>
                        </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default Formation;
