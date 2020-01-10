import React, { Component } from 'react';
import moment from 'moment/moment';
import PropTypes from 'prop-types';
import Stars from './Stars';
import './Avis.scss';

export default class Avis extends Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        highlight: PropTypes.string,
    };

    render() {

        let { avis, highlight } = this.props;
        let { fin } = avis.formation.action.session.periode;

        return (
            <div className="Avis d-flex flex-column align-items-stretch">
                <div className="stagiaire">
                    <Stars note={avis.notes.global} />
                    <span className="par">par</span>
                    <span className="pseudo">{avis.pseudo ? avis.pseudo : 'un stagiaire'}</span>
                </div>
                {avis.commentaire &&
                <div className={`titre ${avis.commentaire.titre ? 'd-block' : 'd-none'}`}>
                    {avis.commentaire.titre}
                </div>
                }
                {avis.commentaire &&
                <div className={`texte ${avis.commentaire.texte ? 'd-block' : 'd-none'}`}>
                    {avis.commentaire.texte}
                </div>
                }
                {avis.reponse &&
                <div className="reponse">
                    <div className="reponse-titre d-flex justify-content-start align-items-center mb-1">
                        <i className="far fa-comment-alt mr-1"></i>
                        <div className="text-uppercase">Réponse de l'organisme</div>
                    </div>
                    <div className="reponse-texte">{avis.reponse.texte}</div>
                </div>
                }
                <div className={`formation ${highlight === 'formation' ? 'highlight' : ''}`}>
                    {avis.formation.intitule} - {moment(fin).format('MM/YYYY')}
                </div>
            </div>
        );
    }
}
