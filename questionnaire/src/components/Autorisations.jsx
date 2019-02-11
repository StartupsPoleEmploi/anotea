import React, { Component } from 'react';

import './Autorisations.scss'

class Autorisations extends Component {

    state = {
        items: [
            {
                id: 1,
                type: 'accord_entreprise',
                description: <span>J'autorise une entreprise à me <strong>contacter</strong>.</span>
            },
            {
                id: 2,
                type: 'accord',
                description: <span>J'autorise les futur(e)s stagiaires à me <strong>questionner</strong> sur cette formation.</span>
            },
        ]
    }

    render() {
        return (
            <div className="autorisations">
                {this.state.items.map((item, index) =>
                    <div className={`item${item.id}`} key={index}>
                        <input type="checkbox" className={`input_${item.type}`} />
                        {item.description}
                    </div>
                )}
            </div>
        );
    }
}

export default Autorisations;
