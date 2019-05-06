import React, { Component } from 'react';

import { getOrganismeStats, getOrganismeAvis, getActionsFormationStats, getSessionsFormationStats, getFormationsStats } from '../lib/avisService';

import AvisAvecCommentaire from './AvisAvecCommentaire';
import AvisAvecCommentaireLarge from './AvisAvecCommentaireLarge';

import Stars from './Stars';
import Verified from './Verified';

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
        this.state = { niveau: props.niveau, siret: props.siret, numeroAction: props.numeroAction, numeroSession: props.numeroSession, numeroFormation: props.numeroFormation }
        if (this.state.niveau === 'organisme') {
            this.loadOrganismeInfo(this.state.siret);
        } else if (this.state.niveau === 'actionFormation')  {
            this.loadActionFormationInfo(this.state.numeroAction);
        } else if (this.state.niveau === 'sessionsFormation')  {
            this.loadSessionsFormationInfo(this.state.numeroSession);
        } else if (this.state.niveau === 'formation')  {
            this.loadFormationInfo(this.state.numeroFormation);
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
        let result = await getActionsFormationStats(numeroAction);

        if (result.actions.length > 0) {
            this.setState({ score: result.actions[0].score, avis: result.actions[0].avis, average: this.getAverage(result.actions[0].avis) });
        }
    }

    loadSessionsFormationInfo = async id => {
        let result = await getSessionsFormationStats(id);

        if (result.sessions.length > 0) {
            this.setState({ score: result.sessions[0].score, avis: result.sessions[0].avis, average: this.getAverage(result.sessions[0].avis) });
        }
    }

    loadFormationInfo = async id => {
        let result = await getFormationsStats(id);

        if (result.formations.length > 0) {
            this.setState({ score: result.formations[0].score, avis: result.formations[0].avis, average: this.getAverage(result.formations[0].avis) });
        } 
    }

    getStyle = () => {
        if (this.props.layout === 'large') {
            if (this.props.width) {
                return { width: `${this.props.width}px`, whiteSpace: 'nowrap' };
            } else {
                return { whiteSpace: 'nowrap' };
            }
        } else if (this.props.layout !== 'large') {
            if (this.props.width) {
                return { width: `${this.props.width}px` };
            } else {
                return { width: '300px' };
            }
        } else {
            return {};
        }
    }

    render() {
        return (

            <div className={`anotea-widget ${this.props.layout === 'large' ? 'large' : ''}`} style={this.getStyle()}>
                <style>{styles}</style>
                {this.state.score &&
                    <div className="col1">
                        <h1 className="title">Avis d'anciens stagiaires</h1>

                        {this.props.layout !== "large" &&
                            <Verified />
                        }


                        <div className="score">
                            <div className="average">
                                <span className="rate">{this.state.average}</span>
                                <span className="total">/5 <span className="fas fa-star active" style={{ width: '14px', height: '14px' }}></span></span>
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

                        {this.props.layout !== "large" &&
                            <AvisAvecCommentaire avis={this.state.avis && this.state.avis.filter(avis => avis.commentaire)} />
                        }

                        <div className="propulsed">
                            Propulsé par <img src={`/img/logo_Anotea_Horizontal_baseline2.png`} alt="logo Anotea" />
                        </div>
                    </div>
                }
                {this.state.score && this.props.layout === "large" &&
                    <div className="col2">
                        <AvisAvecCommentaireLarge width={this.props.width - 260} avis={this.state.avis && this.state.avis.filter(avis => avis.commentaire)} />
                    </div>
                }
                <div className="spacer" style={{ clear: 'both' }}></div>
            </div>

        );
    }
}

export default AnoteaWidget;
