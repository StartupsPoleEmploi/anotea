import React, { Component } from 'react';

import PropTypes from 'prop-types';

class Footer extends Component {

    static propTypes = {
        error: PropTypes.string.isRequired
    };

    render() {
        return (
            <div className="error-panel">
                { this.props.error === 'already sent' &&
                    <span>Vous avez déjà partagé votre avis. Merci.</span>
                }
                { this.props.error === 'error' &&
                    <span>Une erreur est survenue. Veuillez réessayé dans quelques instants.</span>
                }
            </div>
        );
    }
}

export default Footer;
