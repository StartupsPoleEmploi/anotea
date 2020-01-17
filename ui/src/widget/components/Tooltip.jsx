import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Tooltip.scss';

export default class Tooltip extends Component {

    static propTypes = {
        message: PropTypes.node.isRequired,
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

        let { message } = this.props;

        return (
            <div className="Tooltip">
                <div
                    className="icon"
                    onMouseEnter={() => this.show()}
                    onMouseLeave={() => this.hide()}
                >
                    <i className="far fa-question-circle"></i>
                </div>
                {this.state.show &&
                <div className="box">
                    <div className="message">{message}</div>
                </div>
                }
            </div>
        );
    }
}
