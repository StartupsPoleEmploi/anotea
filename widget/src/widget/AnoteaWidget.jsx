import React, { Component } from 'react';
import OrganismeComponent from './OrganismeComponent';
import ActionFormationComponent from './ActionFormationComponent';

class AnoteaWidget extends Component {

    state = {
        niveau: null,
        siret: null,
        numeroAction: null
    }

    constructor() {
        super();
        let e = document.getElementById('widgetAnotea');
        this.state = { niveau: e.getAttribute('niveau'), siret: e.getAttribute('siret'), numeroAction:  e.getAttribute('numeroAction') }
    }

    render() {
        return (
            <div>
                { this.state.niveau === 'organisme' &&
                    <OrganismeComponent siret={this.state.siret} />
                }
                { this.state.niveau === 'actionFormation' &&
                    <ActionFormationComponent numeroAction={this.state.numeroAction} />
                }
            </div>
        );
    }
}

export default AnoteaWidget;
