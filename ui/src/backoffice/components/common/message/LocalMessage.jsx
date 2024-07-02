import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from './Alert';
import './LocalMessage.scss';

export default class LocalMessage extends React.Component {

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
        setTimeout(() => this.props.onClose(), 5000);
    }

    triggerTransition() {
        setTimeout(() => this.setState({ showTransition: true }), 25);
    }

    render() {
        let { message, onClose } = this.props;

        return (
            <div className="Message centered">
                <Alert message={message} onClose={onClose} showTransition={this.state.showTransition} />
            </div>
        );
    }
}
