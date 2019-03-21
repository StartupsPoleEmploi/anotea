import React, { Component } from 'react';

import PropTypes from 'prop-types';

import './globalError.scss';

class GlobalError extends Component {

    static propTypes = {
        error: PropTypes.string.isRequired
    };

    render() {
        return (
            <div className="global-panel">
                {this.props.error === 'already sent' &&
                <h1>Vous avez déjà partagé votre avis. Merci.</h1>
                }
                {this.props.error === 'error' &&
                <h1>Une erreur est survenue. Veuillez réessayer dans quelques instants.</h1>
                }
            </div>
        );
    }
}

export default GlobalError;
