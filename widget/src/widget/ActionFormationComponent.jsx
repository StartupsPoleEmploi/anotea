import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getActionFormationStats } from '../lib/avisService';

class ActionFormationComponent extends Component {

    state = {
        actionFormation: null
    }
    
    static propTypes = {
        numeroAction: PropTypes.string.isRequired
    }

    constructor(props) {
        super();
        this.loadInfos(props);
    }

    async loadInfos(props) {
        let organismes = await getActionFormationStats(props.numeroAction).actions;
        if(organismes.length > 0) {
            this.state.actionFormation = organismes[0];
        }
    }

    render() {
        return (
            <div>
                Action de formation  {this.props.numeroAction}
                { this.state.actionFormation && 
                    <span>{this.state.actionFormation.score.nb_avis} avis</span>
                }
            </div>
        );
    }
}

export default ActionFormationComponent;
