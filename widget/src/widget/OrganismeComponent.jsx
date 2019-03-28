import React, { Component } from 'react';
import { getOrganismeStats, getOrganismeAvis } from '../lib/avisService';
import PropTypes from 'prop-types';

class OrganismeComponent extends Component {

    state = {
        organisme: null,
        avis: []
    }

    static propTypes = {
        siret: PropTypes.string.isRequired
    }

    constructor(props) {
        super();
        this.loadInfos(props);
    }

    async loadInfos(props) {
        let stats = await getOrganismeStats(props.siret);
        let avis = await getOrganismeAvis(props.siret);
        if(stats.organismes_formateurs.length > 0) {
            this.setState({organisme: stats.organismes_formateurs[0], avis: avis.avis });
        }
    }

    render() {
        return (
            <div>
                <h1>Organisme {this.props.siret}</h1>
                { this.state.organisme && 
                    <span>{this.state.organisme.score.nb_avis} avis</span>
                }
                <ul>
                { this.state.avis.map(avis =>
                    <li>{avis.notes.global}</li>
                )}
                </ul>
            </div>
        );
    }
}

export default OrganismeComponent;
