import React, { Component } from 'react';
import PropTypes from 'prop-types';
import calculateRate from './utils/calculateRate';
import './StatsTable.scss';

export default class AvisStatsTable extends Component {

    static propTypes = {
        stats: PropTypes.array.isRequired,
    };

    render() {

        let { stats } = this.props;

        return (
            <table className="StatsTable table table-hover">
                <thead>
                    <tr className="column-name">
                        <th colSpan="1">Régions</th>
                        <th colSpan="2">Stagiaires</th>
                        <th colSpan="4">Mails</th>
                        <th colSpan="2">Avis déposés</th>
                        <th colSpan="4">Commentaires</th>
                    </tr>
                    <tr className="column-subname">
                        <th scope="col"></th>
                        <th scope="col">Importés</th>
                        <th scope="col">Contactés</th>
                        <th scope="col">Envoyés</th>
                        <th scope="col">Ouverts</th>
                        <th scope="col">Cliqués</th>
                        <th scope="col">Validés</th>
                        <th scope="col">Total</th>
                        <th scope="col">Com</th>
                        <th scope="col">À</th>
                        <th scope="col">Positif/neutre</th>
                        <th scope="col">Neg.</th>
                        <th scope="col">Rejetés</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        stats.map((a, index) => (
                            <tr key={index}>
                                <th scope="row">{a.regionName}</th>
                                <td>TODO</td>
                                <td>{a.nbStagiairesContactes}</td>
                                <td>{a.nbMailEnvoyes}</td>
                                <td>{calculateRate(a.nbMailsOuverts, a.nbMailEnvoyes)}</td>
                                <td>{calculateRate(a.nbLiensCliques, a.nbMailsOuverts)}</td>
                                <td>{calculateRate(a.nbQuestionnairesValidees, a.nbLiensCliques)}</td>
                                <td>{calculateRate(a.nbQuestionnairesValidees, a.nbStagiairesContactes)}</td>
                                <td>{calculateRate(a.nbAvisAvecCommentaire, a.nbQuestionnairesValidees)}</td>
                                <td>{a.nbCommentairesAModerer}</td>
                                <td>{calculateRate(a.nbCommentairesPositifs, a.nbAvisAvecCommentaire)}</td>
                                <td>{calculateRate(a.nbCommentairesNegatifs, a.nbAvisAvecCommentaire)}</td>
                                <td>{calculateRate(a.nbCommentairesRejetes, a.nbAvisAvecCommentaire)}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        );
    }
}

