import React, { Component } from 'react';

import './ChampCommentaire.scss';

class ChampCommentaire extends Component {

  render() {
    return (
      <div>
          <span className={`title_${ this.props.type }`}>{ this.props.titre} (optionnel)</span>
          <input className={`input_${ this.props.type }`}/>
      </div>
    );
  }
}

export default ChampCommentaire;
