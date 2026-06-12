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
                <h4 className={`formation sr-only ${highlight === 'formation' ? 'highlight' : ''}`}>
                    Avis sur la formation {avis.formation.intitule} saisi en {moment(fin).format('MMMM YYYY')}
                </h4>
                <p className="stagiaire">
                    <Stars note={avis.notes.global} />
                    <span className="par">par</span>&nbsp;
                    <span className="pseudo">un stagiaire</span>
                </p>
                {avis.commentaire &&
                <h5 className={`titre ${avis.commentaire.titre ? 'd-block' : 'd-none'}`}>
                    {avis.commentaire.titre}
                </h5>
                }
                {avis.commentaire &&
                <p className={`texte ${avis.commentaire.texte ? 'd-block' : 'd-none'}`}>
                    {avis.commentaire.texte}
                </p>
                }
                {avis.reponse &&
                <div className="reponse">
                    <h5 className="reponse-titre d-flex justify-content-start align-items-center mb-1">
                        <i className="far fa-comment-alt mr-1" aria-hidden="true"></i>
                        <span className="text-uppercase">Réponse de l&apos;organisme</span>
                    </h5>
                    <p className="reponse-texte">{avis.reponse.texte}</p>
                </div>
                }
                <p className={`formation ${highlight === 'formation' ? 'highlight' : ''}`} aria-hidden="true">
                    {avis.formation.intitule} - {moment(fin).format('MM/YYYY')}
                </p>
            </div>
        );
    }
}
