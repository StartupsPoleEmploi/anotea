import React, { Component } from 'react';

import PropTypes from 'prop-types';

import './footer.scss';

class Footer extends Component {

  static propTypes = {
    codeRegion: PropTypes.string.isRequired
  };

  render() {
    return (
      <div className="footer">
        <span className="propulsed">Service propulsé par</span>
        <img src='/public/img/poleemploi.png' alt='logo Pôle Emploi' />
        <img src={`/public/img/regions/logo-questionnaire/region-${this.props.codeRegion}.png`} alt='logo région' />
      </div>
    );
  }
}

export default Footer;
