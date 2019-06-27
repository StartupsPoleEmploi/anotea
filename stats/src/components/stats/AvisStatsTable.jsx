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
                        <th scope="col" className="section">Importés <i className="fas fa-question-circle"><span className="tooltip">Nombre de stagiaires présents dans le fichier datalake</span></i></th>
                        <th scope="col">Contactés <i className="fas fa-question-circle"><span className="tooltip">Nombre de stagiaires à qui un mail à été envoyé</span></i></th>
                        <th scope="col" className="section">Envoyés <i className="fas fa-question-circle"><span className="tooltip">Nombre de mails envoyés aux stagiaires</span></i></th>
                        <th scope="col">Ouverts <i className="fas fa-question-circle"><span className="tooltip">Taux d&apos;ouverture de mails</span></i></th>
                        <th scope="col">Cliqués <i className="fas fa-question-circle"><span className="tooltip">Taux de clic dans le lien</span></i> </th>
                        <th scope="col">Validés <i className="fas fa-question-circle"><span className="tooltip">Taux de questionnaires validés</span></i></th>
                        <th scope="col" className="section">Déposés <i className="fas fa-question-circle"><span className="tooltip">Taux d&apos;avis déposés</span></i></th>
                        <th scope="col">Avec commentaires <i className="fas fa-question-circle"><span className="tooltip">Taux d&apos;avis avec commentaire</span></i></th>
                        <th scope="col" className="section">À modérer <i className="fas fa-question-circle"><span className="tooltip">Nombre de commentaires à modérer</span></i></th>
                        <th scope="col">Positif/Neutre <i className="fas fa-question-circle"><span className="tooltip">Taux de commentaires positifs ou neutres</span></i></th>
                        <th scope="col">Negatifs <i className="fas fa-question-circle"><span className="tooltip">Taux de commentaires négatifs</span></i></th>
                        <th scope="col">Rejetés <i className="fas fa-question-circle"><span className="tooltip">Taux de commentaires rejetés</span></i></th>
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
                                    {this.computeRate(a.nbMailsOuverts, a.nbStagiairesContactes)}
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

