import React, { Component } from 'react';

import './Commentaire.scss';
import ChampCommentaire from './ChampCommentaire';

class Commentaire extends Component {

  items = [
      {
          title: 'Votre commentaire',
          placeholder: 'Dites nous ce que vous auriez aimé savoir avant de rentrer en formation. Restez courtois.',
          type: 'commentaire',
      },
      {
        title: 'Titre du commentaire',
        placeholder: 'Le titre permet d’avoir un résumé de votre expérience de la formation.',
        type: 'titre'
      },
      {
        title: 'Pseudo',
        placeholder: 'Choisissez votre pseudo afin de préserver votre anonymat.',
        type: 'pseudo'
      },
  ]

  getItems = () => {
    return this.items.map((item, index) =>
        <ChampCommentaire key={index} titre={item.title} placeholder={item.placeholder} type={item.type}/>
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
