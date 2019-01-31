import React, { Component } from 'react';

import './SendButton.scss';

class SendButton extends Component {
  render() {
      return (
          <button type="button">
              <span className="strong">ENVOYER</span>
          </button>
    );
  }
}

export default SendButton;
