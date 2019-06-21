import React, { Component } from 'react';
import PropTypes from 'prop-types';
import calculateRate from './utils/calculateRate';
import './StatsTable.scss';

export default class AvisStatsTable extends Component {

    static propTypes = {
        stats: PropTypes.array.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            showRates: true,
        };
    }

    computeRate(dividend, divisor) {
        return this.state.showRates ? calculateRate(dividend, divisor) : dividend;
    }

    render() {

        let { stats } = this.props;

        return (
            <table className="StatsTable table table-hover">
                <thead>
                    <tr className="column-name">
                        <th colSpan="1">Régions</th>
                        <th colSpan="2">Stagiaires</th>
                        <th colSpan="4">Emails</th>
                        <th colSpan="2">Avis</th>
                        <th colSpan="4">Commentaires</th>
                    </tr>
                    <tr className="column-subname">
                        <th scope="col">
                            <div>
                                <input
                                    name="showRates"
                                    type="checkbox"
                                    checked={this.state.showRates}
                                    onChange={() => this.setState({ showRates: !this.state.showRates })} />
                                <span> Taux</span>
                            </div>
                        </th>
                        <th scope="col" className="section">Importés</th>
                        <th scope="col">Contactés</th>
                        <th scope="col" className="section">Envoyés</th>
                        <th scope="col">Ouverts</th>
                        <th scope="col">Cliqués</th>
                        <th scope="col">Validés</th>
                        <th scope="col" className="section">Déposés</th>
                        <th scope="col">Avec commentaires</th>
                        <th scope="col" className="section">À modérer</th>
                        <th scope="col">Positif/Neutre</th>
                        <th scope="col">Negatifs</th>
                        <th scope="col">Rejetés</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        stats.map((a, index) => (
                            <tr key={index}>
                                <th scope="row">
                                    {a.label}
                                </th>
                                <td className="section">
                                    {a.nbStagiairesImportes}
                                </td>
                                <td>
                                    {a.nbStagiairesContactes}
                                </td>
                                <td className="section">
                                    {a.nbMailEnvoyes}
                                </td>
                                <td>
                                    {this.computeRate(a.nbMailsOuverts, a.nbMailEnvoyes)}
                                </td>
                                <td>
                                    {this.computeRate(a.nbLiensCliques, a.nbMailsOuverts)}
                                </td>
                                <td>
                                    {this.computeRate(a.nbQuestionnairesValidees, a.nbLiensCliques)}
                                </td>
                                <td className="section">
                                    {this.computeRate(a.nbQuestionnairesValidees, a.nbStagiairesContactes)}
                                </td>
                                <td>
                                    {this.computeRate(a.nbAvisAvecCommentaire, a.nbQuestionnairesValidees)}
                                </td>
                                <td className="section">
                                    {a.nbCommentairesAModerer}
                                </td>
                                <td>
                                    {this.computeRate(a.nbCommentairesPositifs, a.nbAvisAvecCommentaire)}
                                </td>
                                <td>
                                    {this.computeRate(a.nbCommentairesNegatifs, a.nbAvisAvecCommentaire)}
                                </td>
                                <td>
                                    {this.computeRate(a.nbCommentairesRejetes, a.nbAvisAvecCommentaire)}
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        );
    }
}

