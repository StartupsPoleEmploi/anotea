import React, { Component } from 'react';

import './header.scss';

class Header extends Component {

  render() {
    return (
      <div>
        <img className="logo" src="/images/logo.png" alt="logo Anotéa" />
        <h1>Notez et commentez votre formation</h1>
        <h2><strong>Compétences de base Professionnelles</strong> | 09/07/2018 au 31/12/2018 
GRETA DE L'ESSONNE - Épinay-sous-Sénart
        </h2>
      </div>
    );
  }
}

export default Header;