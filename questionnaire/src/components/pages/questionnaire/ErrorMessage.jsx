import React, { Component } from 'react';

import './error-alert.scss';

class ErrorMessage extends Component {

    render() {
        return (
            <div className="error-message">
                <p>Une erreur est survenue lors de l&apos;envoi du questionnaire.</p>
                <p>Veuillez réessayer dans quelques instants.</p>
            </div>
        );
    }
}

export default ErrorMessage;
