import React, { Component } from 'react';

import './notes.scss';

import Note from './Note';
import NoteMoyenne from './NoteMoyenne';

class Notes extends Component {

  items = [
      {
          title: 'Accueil',
          description: 'Réunions d\'information collective et entretiens à l\'entrée en formation.'
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
    return this.items.map((item, index) =>
        <Note key={index} title={item.title} description={item.description} parity={index % 2 === 0 ? 'even' : 'odd'} />
    );
  }

  render() {
    return (
        <div>
            <h3>Notes</h3>

            { this.getItems() }

            <NoteMoyenne />
        </div>
    );
  }
}

export default Notes;
