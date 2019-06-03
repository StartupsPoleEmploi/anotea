import React, { Component } from 'react';
import './OrganismesStatsTable.scss';

export default class OrganismesStatsTable extends Component {

    render() {

        const columns_title = [
            {id: 1, value: ''},
            {id: 2, value: 'Total'},
            {id: 3, value: 'Total'},
            {id: 4, value: 'Ouverts'},
            {id: 5, value: 'Cliqués'},
            {id: 6, value: 'Actifs'},
            {id: 7, value: 'Connexion'},
            {id: 8, value: 'Non lus'},
            {id: 9, value: 'Répondus'},
            {id: 10, value: 'Av. com'},
            {id: 11, value: 'Notes seules'},
            {id: 11, value: 'Signalés'},
            {id: 11, value: 'Rejetés'},
        ];
        
        return (
            <div className="container table-responsive">
                <table class="table">
                    <thead>
                        <tr className="table-colspan">
                            <th colSpan="1">Régions</th>
                            <th colSpan="1">OF contactés</th>
                            <th colSpan="3">Mails envoyés</th>
                            <th colSpan="2">Comptes</th>
                            <th colSpan="5">Avis</th>
                        </tr>
                        <tr>
                            {columns_title.map( title => (
                                <th key={title.id} scope="col">{title.value}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row">PACA</th>
                            <td>1997</td>
                            <td>12122</td>
                            <td>11%</td>
                            <td>1997</td>
                            <td>12122</td>
                            <td>11%</td>
                            <td>1997</td>
                            <td>12122</td>
                            <td>11%</td>
                            <td>1997</td>
                            <td>12122</td>
                            <td>11%</td>
                        </tr>
                        <tr>
                            <th scope="row">HDF</th>
                            <td>653</td>
                            <td>12166</td>
                            <td>11%</td>
                            <td>1997</td>
                            <td>12122</td>
                            <td>11%</td>
                            <td>1997</td>
                            <td>12122</td>
                            <td>11%</td>
                            <td>1997</td>
                            <td>12122</td>
                            <td>11%</td>
                        </tr>
                        <tr>
                            <th scope="row">VDL</th>
                            <td>888</td>
                            <td>12188</td>
                            <td>11%</td>
                            <td>1997</td>
                            <td>12122</td>
                            <td>11%</td>
                            <td>1997</td>
                            <td>12122</td>
                            <td>11%</td>
                            <td>1997</td>
                            <td>12122</td>
                            <td>11%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}
