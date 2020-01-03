import React, { Component } from "react";
import PropTypes from "prop-types";
import Stars from "./Stars";
import "./note.scss";

class Note extends Component {

    static propTypes = {
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        onSelect: PropTypes.func.isRequired,
        index: PropTypes.number.isRequired,
        value: PropTypes.number
    };

    render() {
        return (
            <div className="note">
                <div className={`row inner-row align-items-center`}>
                    <div className="col-sm-7">
                        <div className="title">{this.props.title}</div>
                        <div className="description">{this.props.description}</div>
                    </div>
                    <div className="col-sm-5 stars-container d-flex justify-content-md-end">
                        <Stars onSelect={this.props.onSelect} index={this.props.index} value={this.props.value} />
                    </div>
                </div>
            </div>
        );
    }
}

export default Note;
