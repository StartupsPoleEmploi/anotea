import React from 'react';
import PropTypes from 'prop-types';
import './Message.scss';

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
    }

    triggerTransition() {
        setTimeout(() => this.setState({ showTransition: true }), 5);
    }

    render() {
        let { message, onClose } = this.props;
        let transitionClass = this.state.showTransition ? 'show' : '';

        return (
            <div className={`Message alert alert-dismissible fade ${transitionClass}`} role="alert">
                <h4 className="alert-heading title">{message.title}</h4>
                <span>{message.text}</span>

                <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={onClose}>
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        );
    }
}
