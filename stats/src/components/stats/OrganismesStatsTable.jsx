import React, { Component } from 'react';
import PropTypes from 'prop-types';
import calculateRate from './utils/calculateRate';
import './StatsTable.scss';

export default class OrganismesStatsTable extends Component {

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
                        <th colSpan="1">OF contactés</th>
                        <th colSpan="3">Mails envoyés</th>
                        <th colSpan="1">Comptes</th>
                        <th colSpan="5">Avis</th>
                    </tr>
                    <tr className="column-subname">
                        <th scope="col"></th>
                        <th scope="col">Total</th>
                        <th scope="col">Total</th>
                        <th scope="col">Ouverts</th>
                        <th scope="col">Cliqués</th>
                        <th scope="col">Actifs</th>
                        <th scope="col">Non lus</th>
                        <th scope="col">Répondus</th>
                        <th scope="col">Avec rép.</th>
                        <th scope="col">Signalés</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        stats.map((o, index) => (
                            <tr key={index}>
                                <th scope="row">{o.regionName}</th>
                                <td>{o.nbOrganismesContactes}</td>
                                <td>{o.mailsEnvoyes}</td>
                                <td>{calculateRate(o.ouvertureMails, o.nbOrganismesContactes)}</td>
                                <td>{calculateRate(o.nbClicDansLien, o.ouvertureMails)}</td>
                                <td>{calculateRate(o.organismesActifs, o.nbOrganismesContactes)}</td>
                                <td>{calculateRate(o.avisNonLus, o.avisModeresNonRejetes)}</td>
                                <td>{calculateRate(o.nbCommentairesAvecOrganismesReponses, o.avisModeresNonRejetes)}</td>
                                <td>{calculateRate(o.nbAvisAvecOrganismesReponses, o.avisModeresNonRejetes)}</td>
                                <td>{calculateRate(o.avisSignales, o.avisModeresNonRejetes)}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        );
    }
}

