import React, { Component } from 'react';

import './Autorisations.scss'

class Autorisations extends Component {

  state = {
    items : [
        {
            id: 1,
            type: 'accord',
            description: `J'autorise une entreprise à me contacter.`
        },
        {
          id: 2,
          type: 'accord_entreprise',
          description: `J'autorise les futur(e)s stagiaires à me questionner sur cette formation.`
        },
    ]
  }

  render() {
    return (
      <div className="autorisations">
        {this.state.items.map((item, index) =>
          <div className={`item${ item.id }`} key={index}>
              <input type="checkbox" className={`input_${ item.type }`}/>
              <span className={`span_${ item.type }`}>{item.description}</span>
          </div>
        )}
      </div>
    );
  }
}

export default Autorisations;
