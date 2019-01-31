import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './ChampCommentaire.scss';

class ChampCommentaire extends Component {

  static propTypes = {
      titre: PropTypes.string.isRequired,
      placeholder: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
  };

  render() {
    return (
      <div className="Champ-commentaire">
          <span className={`title_${ this.props.type }`}><strong>{this.props.titre}</strong> (optionnel)</span>
          <textarea className={`textarea_${ this.props.type }`} type="text" placeholder={this.props.placeholder}/>
      </div>
    );
  }
}

export default ChampCommentaire;
