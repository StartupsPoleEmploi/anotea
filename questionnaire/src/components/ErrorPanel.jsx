import React, { Component } from 'react';

import PropTypes from 'prop-types';

import './errorPanel.scss';

class ErrorPanel extends Component {

    static propTypes = {
        error: PropTypes.string.isRequired
    };

    render() {
        return (
            <div className="error-panel">
                <img className="logo" src={`${process.env.PUBLIC_URL}/images/logo.png`} alt="logo Anotéa" />
                <span className="propulsed">Service propulsé par</span>
                <img className="logoPE" src="/img/poleemploi.png" alt="logo Pôle Emploi" />

                {this.props.error === 'already sent' &&
                <h1>Vous avez déjà partagé votre avis. Merci.</h1>
                }
                {this.props.error === 'error' &&
                <h1>Une erreur est survenue. Veuillez réessayé dans quelques instants.</h1>
                }
            </div>
        );
    }
}

export default ErrorPanel;
