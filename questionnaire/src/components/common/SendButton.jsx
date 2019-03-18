import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './sendButton.scss';

class SendButton extends Component {

    static propTypes = {
        onSend: PropTypes.func.isRequired,
        enabled: PropTypes.bool.isRequired,
        text: PropTypes.string
    };

    render() {
        return (
            <div className="send-button">
                <button className="send-button" type="button" onClick={this.props.onSend}
                        disabled={!this.props.enabled}>
                    {this.props.text ? this.props.text : 'Envoyer'}
                </button>
            </div>
        );
    }
}

export default SendButton;
