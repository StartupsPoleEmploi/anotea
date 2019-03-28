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
        let result = await getOrganismeStats(props.siret);
        if(result.organismes_formateurs.length > 0) {
            this.setState({organisme: result.organismes_formateurs[0]});
        }
    }

    render() {
        return (
            <div>
                <h1>Organisme {this.props.siret}</h1>
                { this.state.organisme && 
                    <span>{this.state.organisme.score.nb_avis} avis</span>
                }
            </div>
        );
    }
}

export default OrganismeComponent;
