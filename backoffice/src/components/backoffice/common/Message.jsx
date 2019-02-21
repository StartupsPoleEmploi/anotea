import React from 'react';
import PropTypes from 'prop-types';
import './Message.scss';

class Alert extends React.Component {

    static propTypes = {
        message: PropTypes.object.isRequired,
        showTransition: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
    };

    render() {
        let { message, onClose, showTransition } = this.props;
        let transitionClass = showTransition ? 'show' : '';

        return (
            <div className={`alert alert-dismissible fade ${transitionClass}`} role="alert">
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

export default class Message extends React.Component {

    static propTypes = {
        message: PropTypes.object.isRequired,
        onClose: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            showTransition: false,
        };
    }

    componentDidMount() {
        this.triggerTransition();
        if (this.props.message.global) {
            setTimeout(() => this.props.onClose(), 5000);
        }
    }

    triggerTransition() {
        setTimeout(() => this.setState({ showTransition: true }), 25);
    }

    buildGlobalMessage() {
        let { message, onClose } = this.props;
        return (
            <div className="Message fixed-bottom d-flex justify-content-center">
                <div className="global">
                    <Alert message={message} onClose={onClose} showTransition={this.state.showTransition} />
                </div>
            </div>
        );
    }

    buildCenteredMessage() {
        let { message, onClose } = this.props;
        return (
            <div className="Message a-centered">
                <Alert message={message} onClose={onClose} showTransition={this.state.showTransition} />
            </div>
        );
    }

    render() {
        switch (this.props.message.position) {
            case 'centered':
                return this.buildCenteredMessage();
            case 'global':
            default:
                return this.buildGlobalMessage();
        }
    }
}
