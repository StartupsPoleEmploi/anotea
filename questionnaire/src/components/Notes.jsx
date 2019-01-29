import React, { Component } from 'react';

import './notes.scss';

import Note from './Note';

class Notes extends Component {

  items = [
      {
          title: 'Accueil',
          description: 'Voici la moyenne des notes que vous avez données.'
      },
      {
        title: 'Contenu de la formation',
        description: 'Programme, supports pédagogiques, organisation de modules, alternance théorie/pratique.'
      },
      {
        title: 'Équipe de formateurs',
        description: 'Prise en compte du besoin des stagiaires.'
      },
      {
        title: 'Moyens matériels mis à disposition',
        description: 'Salles de cours, documentation, plateaux techniques, équipement informatique.'
      },
      {
        title: 'Accompagnement',
        description: 'Aide à la recherche de stage/emploi, mise en relation et rencontre avec les entreprises.'
      }
  ]

  getItems = () => {
    return this.items.map(item => 
        <Note title={item.title} description={item.description} />
    );
  }

  render() {
    return (
      <div>
          <h3>Notes</h3>

          { this.getItems() }
        </div>
    );
  }
}

export default Notes;