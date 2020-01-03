import React from "react";
import PropTypes from "prop-types";
import "./Alert.scss";

export class Alert extends React.Component {

    static propTypes = {
        message: PropTypes.object.isRequired,
        showTransition: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
    };

    render() {
        let { message, onClose, showTransition } = this.props;
        let transitionClass = showTransition ? "show" : "";

        return (
            <div className={`Alert alert alert-dismissible fade ${transitionClass} ${message.color || ""}`}
                 role="alert">
                {message.title &&
                <h4 className="alert-heading title">{message.title}</h4>
                }
                <span>{message.text}</span>

                <button
                    type="button"
                    className="close"
                    data-dismiss="alert"
                    aria-label="Close"
                    onClick={onClose}>
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        );
    }
}
