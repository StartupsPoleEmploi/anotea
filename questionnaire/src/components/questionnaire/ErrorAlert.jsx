import React, { Component } from 'react';

import './error-alert.scss';

class ErrorAlert extends Component {

    render() {
        return (
            <div className="error-alert">
                <p>Une erreur est survenue lors de l'envoi du questionnaire.</p>
                <p>Veuillez réessayer dans quelques instants.</p>
            </div>
        );
    }
}

export default ErrorAlert;
