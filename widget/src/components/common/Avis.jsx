import React, { Component } from 'react';
import moment from 'moment/moment';
import PropTypes from 'prop-types';
import Stars from './Stars';
import './Avis.scss';
import Option from './options/Option';
import Tooltip from './Tooltip';

export default class Avis extends Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
    };

    render() {

        let { avis } = this.props;
        let { debut, fin } = avis.formation.action.session.periode;

        return (
            <div className="Avis d-flex flex-column align-items-stretch">
                <div className="stagiaire">
                    <Stars note={avis.notes.global} />
                    <span className="par">par</span>
                    <span className="pseudo">{avis.pseudo ? avis.pseudo : 'un stagiaire'}</span>
                </div>
                {avis.commentaire &&
                <div className={`titre ${avis.commentaire.titre ? 'visible' : 'invisible'}`}>
                    {avis.commentaire.titre}
                </div>
                }
                {avis.commentaire &&
                <div className={`texte ${avis.commentaire.texte ? 'visible' : 'invisible'}`}>
                    {avis.commentaire.texte}
                </div>
                }
                {avis.reponse &&
                <div className="reponse">
                    <div className="titre">Réponse de l'organisme</div>
                    <div className="texte">{avis.reponse.texte}</div>
                </div>
                }
                <div className="date with-tooltip d-inline-flex justify-content-between">
                    <div>Session du {moment(debut).format('DD/MM/YYYY')}
                        {debut !== fin &&
                        <span> au {moment(fin).format('DD/MM/YYYY')}</span>
                        }
                    </div>
                    <Option value="avis-details" render={() => {
                        return (
                            <Tooltip direction="right" message={
                                <div>
                                    <div>Formation : {avis.formation.intitule} </div>
                                    <div>Lieu de formation :{avis.formation.action.lieu_de_formation.code_postal}</div>
                                </div>
                            } />
                        );
                    }} />
                </div>
            </div>
        );
    }
}
