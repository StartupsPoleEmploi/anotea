import React, { Component } from 'react';

import './Commentaire.scss';
import ChampCommentaire from './ChampCommentaire';

class Commentaire extends Component {

  items = [
      {
          title: 'Votre commentaire',
          placeholder: 'Votre commentaire',
          type: 'commentaire',
      },
      {
        title: 'Titre du commentaire',
        placeholder: 'Titre du commentaire',
        type: 'titre'
      },
      {
        title: 'Pseudo',
        placeholder: 'Pseudo',
        type: 'pseudo'
      },
  ]

  getItems = () => {
    return this.items.map(item =>
        <ChampCommentaire titre={item.title} placeholder={item.placeholder} type={item.type}/>
    );
  }

  render() {
    return (
      <div>
          <h3>Commentaire (optionnel)</h3>
          { this.getItems() }
      </div>
    );
  }
}

export default Commentaire;
