import React                from 'react';
import {FormattedDate}      from "react-intl";

export default class TrainingInfo extends React.Component {

    state = {};

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="col-md-3">
                <div>
                    <strong>Organisme</strong> {this.props.training.organisation.name}
                </div>
                <div>
                    <strong>Formation</strong> {this.props.training.title}
                </div>
                <div>
                    <strong>Session</strong> {this.props.training.place.city}
                </div>
                <div>
                    du <strong><FormattedDate
                    value={new Date(this.props.training.startDate)}
                    day="numeric"
                    month="numeric"
                    year="numeric"/></strong>
                    &nbsp;au <strong><FormattedDate
                    value={new Date(this.props.training.scheduledEndDate)}
                    day="numeric"
                    month="numeric"
                    year="numeric"/></strong>
                </div>
            </div>
        );
    }
}
