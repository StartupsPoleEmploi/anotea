import React, { Component } from "react";
import PropTypes from "prop-types";
import "./Tooltip.scss";

export default class Tooltip extends Component {

    static propTypes = {
        message: PropTypes.node.isRequired,
        direction: PropTypes.string,
    };

    state = {
        show: false,
    };

    show = () => {
        return this.setState({ show: true });
    };

    hide = () => {
        return this.setState({ show: false });
    };

    render() {

        let { message, direction = "left" } = this.props;

        return (
            <div className="Tooltip">
                <div className="icon">
                    <i
                        className="far fa-question-circle"
                        onMouseEnter={() => this.show()}
                        onMouseLeave={() => this.hide()}
                    ></i>
                    {this.state.show && <div className="triangle"></div>}
                </div>
                {this.state.show &&
                <div className={`box ${direction}`}>
                    <div className="message">{message}</div>
                </div>
                }
            </div>
        );
    }
}
