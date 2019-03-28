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
        let result = await getActionFormationStats(props.numeroAction);
        if(result.actions.length > 0) {
            this.setState({ actionFormation: result.actions[0]});
        }
    }

    render() {
        return (
            <div>
                <h1>Action de formation  {this.props.numeroAction}</h1>
                { this.state.actionFormation && 
                    <span>{this.state.actionFormation.score.nb_avis} avis</span>
                }
            </div>
        );
    }
}

export default ActionFormationComponent;
