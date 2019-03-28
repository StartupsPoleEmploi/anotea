import React, { Component } from 'react';
import { getOrganismeStats } from '../lib/avisService';
import PropTypes from 'prop-types';

class OrganismeComponent extends Component {

    state = {
        organisme: null
    }

    static propTypes = {
        siret: PropTypes.string.isRequired
    }

    constructor(props) {
        super();
        this.loadInfos(props);
    }

    async loadInfos(props) {
        let organismes = await getOrganismeStats(props.siret).organismes_formateurs;
        if(organismes.length > 0) {
            this.state.organisme = organismes[0];
        }
    }

    render() {
        return (
            <div>
                Organisme {this.props.siret}
                { this.state.organisme && 
                    <span>{this.state.organisme.score.nb_avis} avis</span>
                }
            </div>
        );
    }
}

export default OrganismeComponent;
