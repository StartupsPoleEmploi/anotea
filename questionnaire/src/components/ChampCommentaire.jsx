import React, { Component } from 'react';

import './ChampCommentaire.scss';

class ChampCommentaire extends Component {

  render() {
    return (
      <div>
          <span className={`title_${ this.props.type }`}><strong>{ this.props.titre}</strong> (optionnel)</span>
          <textarea className={`textarea_${ this.props.type }`} type="text" placeholder={this.props.placeholder}/>
      </div>
    );
  }
}

export default ChampCommentaire;
