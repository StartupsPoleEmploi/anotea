import React from "react";
import PropTypes from "prop-types";
import { Alert } from "./Alert";
import "./GlobalMessage.scss";

export default class GlobalMessage extends React.Component {

    static propTypes = {
        message: PropTypes.object.isRequired,
        onClose: PropTypes.func.isRequired,
        timeout: PropTypes.number,
    };

    constructor(props) {
        super(props);
        this.state = {
            showTransition: false,
        };
    }

    componentDidMount() {
        this.triggerTransition();
        setTimeout(() => this.props.onClose(), this.props.message.timeout || 2500);
    }

    triggerTransition() {
        setTimeout(() => this.setState({ showTransition: true }), 25);
    }

    render() {
        let { message, onClose } = this.props;
        return (
            <div className="GlobalMessage fixed-bottom d-flex justify-content-center">
                <div className="size">
                    <Alert message={message} onClose={onClose} showTransition={this.state.showTransition} />
                </div>
            </div>
        );
    }
}
