import React, { Component } from 'react';

import { getOrganismeStats, getOrganismeAvis, getActionsFormationStats } from '../lib/avisService';

import styles from './anoteaTinyWidget.css.js';

class AnoteaTinyWidget extends Component {

    state = {
        score: null,
        avis: [],
        average: 0
    }

    constructor(props) {
        super();
        if (props.niveau === 'organisme') {
            this.loadOrganismeInfo(props.siret);
        } else {
            this.loadActionFormationInfo(props.numeroAction);
        }
    }

    loadOrganismeInfo = async siret => {
        let stats = await getOrganismeStats(siret);
        let avis = await getOrganismeAvis(siret);
        if (stats.organismes_formateurs.length > 0) {
            this.setState({ score: stats.organismes_formateurs[0].score, avis: avis.avis, average: this.getAverage(avis.avis) });
        }
    }

    loadActionFormationInfo = async numeroAction => {
        let result = await getActionsFormationStats(numeroAction);

        if (result.actions.length > 0) {
            this.setState({ score: result.actions[0].score, avis: result.actions[0].avis, average: this.getAverage(result.actions[0].avis) });
        }
    }

    getAverage = avis => {
        let sum = 0;
        avis.forEach(avis => {
            sum += avis.notes.global;
        })
        let average = Math.round(sum * 10 / avis.length) / 10;

        return `${average}`.replace('.', ',');
    }

    render() {
        return (
            <div className='anotea-tiny-widget'>
                <style>{styles}</style>
                { this.state.score &&
                    <div>
                        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css" integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf" crossOrigin="anonymous"></link>
                        <div className="average">
                            <span className="rate">{this.state.average}</span>
                            <span className="total">/5 <span className="fas fa-star active" style={{width: '14px', height: '14px'}}></span></span>
                        </div>
                    
                        <div className="avis-count">
                            {this.state.score.nb_avis} notes
                        </div>
                    </div>
                }
                { !this.state.score &&
                    <span>0 avis</span>
                }
            </div>
        )
    }

};

export default AnoteaTinyWidget;