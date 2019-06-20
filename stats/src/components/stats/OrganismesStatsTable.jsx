import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
                        stats.map((organisme, index) => (
                            <tr key={index}>
                                <th scope="row">{organisme.regionName}</th>
                                <td>{organisme.nbOrganismesContactes}</td>
                                <td>{organisme.mailsEnvoyes}</td>
                                <td>{organisme.tauxOuvertureMails}</td>
                                <td>{organisme.tauxClicDansLien}</td>
                                <td>{organisme.tauxOrganismesActifs}</td>
                                <td>{organisme.tauxAvisNonLus}</td>
                                <td>{organisme.tauxCommentairesAvecReponses}</td>
                                <td>{organisme.tauxAvisAvecReponses}</td>
                                <td>{organisme.tauxAvisSignales}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        );
    }
}

