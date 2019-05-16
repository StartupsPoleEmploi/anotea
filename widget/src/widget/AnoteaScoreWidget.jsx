import React, { Component } from 'react';
import { getOrganismesFormateurs, getAvis, getActions, getFormations } from './services/avisService';
import Star from "./icons/Star";

class AnoteaScoreWidget extends Component {

    state = {
        score: null,
        avis: [],
        average: 0
    };

    constructor(props) {
        super();
        if (props.type === 'organisme') {
            this.loadOrganismeInfo(props.siret);
        } else {
            this.loadActionFormationInfo(props.numeroAction);
        }
    }

    getAverage = note => `${note}`.replace('.', ',');

    loadOrganismeInfo = async siret => {
        let [stats, avis] = await Promise.all([
            getOrganismesFormateurs(siret),
            getAvis(siret)
        ]);
        if (stats.organismes_formateurs.length > 0) {
            this.setState({
                score: stats.organismes_formateurs[0].score,
                avis: avis.avis,
                average: this.getAverage(stats.organismes_formateurs[0].score.notes.global)
            });
        }
    };

    loadActionFormationInfo = async numeroAction => {
        let result = await getActions(numeroAction);

        if (result.actions.length > 0) {
            this.setState({
                score: result.actions[0].score,
                avis: result.actions[0].avis,
                average: this.getAverage(result.actions[0].score.notes.global)
            });
        }
    };

    loadFormationInfo = async id => {
        let result = await getFormations(id);

        if (result.formations.length > 0) {
            this.setState({
                score: result.formations[0].score,
                avis: result.formations[0].avis,
                average: this.getAverage(result.formations[0].score.notes.global)
            });
        }
    };

    render() {
        return (
            <div className='anotea-tiny-widget'>
                {this.state.score &&
                <div>
                    <div className="average">
                        <span className="rate">{this.state.average}</span>
                        <span className="total">/5
                            <Star active={true} />
                        </span>
                    </div>

                    <div className="avis-count">
                        {this.state.score.nb_avis} notes
                    </div>
                </div>
                }
                {!this.state.score &&
                <span>0 avis</span>
                }
            </div>
        )
    }

}

export default AnoteaScoreWidget;
