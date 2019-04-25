import React, { Component } from 'react';

import { getOrganismeStats, getOrganismeAvis } from '../lib/avisService';
import { getActionFormationStats } from '../lib/avisService';

import AvisAvecCommentaire from './AvisAvecCommentaire';

import Stars from './Stars';

import styles from './anoteaWidget.css.js';

class AnoteaWidget extends Component {

    state = {
        niveau: null,
        siret: null,
        numeroAction: null,
        score: null,
        avis: [],
        average: 0
    }

    constructor(props) {
        super();
        this.state = { niveau: props.niveau, siret: props.siret, numeroAction: props.numeroAction }
        if (this.state.niveau === 'organisme') {
            this.loadOrganismeInfo(this.state.siret);
        } else {
            this.loadActionFormationInfo(this.state.numeroAction);
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

    loadOrganismeInfo = async siret => {
        let stats = await getOrganismeStats(siret);
        let avis = await getOrganismeAvis(siret);
        if (stats.organismes_formateurs.length > 0) {
            this.setState({ score: stats.organismes_formateurs[0].score, avis: avis.avis, average: this.getAverage(avis.avis) });
        }
    }

    loadActionFormationInfo = async numeroAction => {
        let result = await getActionFormationStats(numeroAction);

        if (result.actions.length > 0) {
            this.setState({ score: result.actions[0].score, avis: result.actions[0].avis, average: this.getAverage(result.actions[0].avis) });
        }
    }

    render() {
        return (
            <div className="anotea-widget">
                <style>{styles}</style>
                <h1 className="title">Avis d'anciens stagiaires</h1>

                <div className="verified">
                    vérifiés par <img src={`/img/poleemploi.png`} alt="logo Pôle Emploi" />
                </div>

                {this.state.score &&
                    <div className="score">
                        <div className="average">
                            <span className="rate">{this.state.average}</span>
                            <span className="total">/5 <span class="fas fa-star active" style={{width: '14px', height: '14px'}}></span></span>
                            <span className="avis-count">{this.state.score.nb_avis} notes</span>
                        </div>                     
 
                        <ul className="notes">
                            <li>
                                <span className="label">Accueil</span> <Stars value={this.state.score.notes.accueil} />
                            </li>
                            <li>
                                <span className="label">Contenu</span> <Stars value={this.state.score.notes.contenu_formation} />
                            </li>
                            <li>
                                <span className="label">Formateurs</span> <Stars value={this.state.score.notes.equipe_formateurs} />
                            </li>
                            <li>
                                <span className="label">Moyens</span> <Stars value={this.state.score.notes.moyen_materiel} />
                            </li>
                            <li>
                                <span className="label">Accompagnement</span> <Stars value={this.state.score.notes.accompagnement} />
                            </li>
                        </ul>
                    </div>
                }

                <AvisAvecCommentaire avis={this.state.avis && this.state.avis.filter(avis => avis.commentaire)} />

                <div className="propulsed">
                    Propulsé par <img src={`/img/logo_Anotea_Horizontal_baseline2.png`} alt="logo Anotea" />
                </div>

            </div>
        );
    }
}

export default AnoteaWidget;
