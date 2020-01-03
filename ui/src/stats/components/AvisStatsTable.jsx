import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import calculateRate from "./utils/calculateRate";
import "./StatsTable.scss";

export default class AvisStatsTable extends Component {

    static propTypes = {
        stats: PropTypes.array.isRequired,
        campaignStats: PropTypes.array.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            showRates: false,
        };
    }

    computeRate(dividend, divisor) {
        return this.state.showRates ? calculateRate(dividend, divisor) : dividend;
    }

    getTotal = string => {
        return this.props.campaignStats.map(e => e[string]).reduce((a, b) => a + b);
    };

    render() {

        let { stats, campaignStats } = this.props;

        return (
            <div>
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
                            <th scope="col" className="section">
                                <span>Importés</span>
                                <i className="fas fa-question-circle">
                                    <span
                                        className="tooltip">Nombre de stagiaires présents dans le fichier datalake</span></i>
                            </th>
                            <th scope="col">
                                <span>Contactés</span>
                                <i className="fas fa-question-circle">
                                    <span className="tooltip">Nombre de stagiaires à qui un mail à été envoyé</span></i>
                            </th>
                            <th scope="col" className="section">
                                <span>Envoyés</span>
                                <i className="fas fa-question-circle">
                                    <span className="tooltip">Nombre de mails envoyés aux stagiaires</span></i>
                            </th>
                            <th scope="col">
                                <span>Ouverts</span>
                                <i className="fas fa-question-circle">
                                    <span
                                        className="tooltip">Nombre de mails ouverts / nombre de stagiaires contactés</span></i>
                            </th>
                            <th scope="col">
                                <span>Cliqués</span>
                                <i className="fas fa-question-circle">
                                    <span
                                        className="tooltip">Nombre de clics dans le mail / nombre de mails ouverts</span></i>
                            </th>
                            <th scope="col">
                                <span>Validés</span>
                                <i className="fas fa-question-circle">
                                    <span className="tooltip">Nombre de questionnaires validés / nombre de clics dans le lien</span>
                                </i>
                            </th>
                            <th scope="col" className="section">
                                <span>Déposés</span>
                                <i className="fas fa-question-circle">
                                    <span className="tooltip">Nombre de questionnaires validés / nombre de stagiaires contactés</span>
                                </i>
                            </th>
                            <th scope="col">
                                <span>Avec commentaires</span>
                                <i className="fas fa-question-circle">
                                    <span
                                        className="tooltip">Nombre de commentaires / nombre de questionnaires validés</span>
                                </i>
                            </th>
                            <th scope="col" className="section">
                                <span>À modérer</span>
                                <i className="fas fa-question-circle">
                                    <span className="tooltip">Nombre de commentaires à modérer</span></i>
                            </th>
                            <th scope="col">
                                <span>Positif/Neutre</span>
                                <i className="fas fa-question-circle">
                                    <span className="tooltip">Nombre de commentaires tagués positifs / nombre de commentaires total</span>
                                </i>
                            </th>
                            <th scope="col">
                                <span>Negatifs</span>
                                <i className="fas fa-question-circle">
                                    <span className="tooltip">Nombre de commentaires tagués négatifs / nombre de commentaires total</span>
                                </i>
                            </th>
                            <th scope="col">
                                <span>Rejetés</span>
                                <i className="fas fa-question-circle">
                                    <span className="tooltip">Nombre de commentaires rejetés / nombre de commentaires total</span>
                                </i>
                            </th>
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

                <div className="separator div-transparent"></div>

                <table className="StatsTable table table-hover">
                    <thead>
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
                            <th scope="col">Date</th>
                            <th scope="col">Mails envoyés</th>
                            <th scope="col">Mails ouverts</th>
                            <th scope="col">Taux d&apos;ouverture</th>
                            <th scope="col">Ouverture de lien</th>
                            <th scope="col">Taux de clic</th>
                            <th scope="col">Personnes ayant validé le questionnaire</th>
                            <th scope="col">Taux de répondant</th>
                            <th scope="col">Commentaires</th>
                            <th scope="col">Taux avis avec commentaire</th>
                            <th scope="col">Commentaires rejetés</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row">
                                Toutes
                            </th>
                            <td>
                                -
                            </td>
                            <td>
                                {this.getTotal("mailSent")}
                            </td>
                            <td>
                                {this.getTotal("mailOpen")}
                            </td>
                            <td>
                                {this.computeRate(this.getTotal("mailOpen"), this.getTotal("mailSent"))}
                            </td>
                            <td>
                                {this.getTotal("linkClick")}
                            </td>
                            <td>
                                {this.computeRate(this.getTotal("linkClick"), this.getTotal("mailOpen"))}
                            </td>
                            <td>
                                {this.getTotal("formValidated")}
                            </td>
                            <td>
                                {this.computeRate(this.getTotal("formValidated"), this.getTotal("mailSent"))}
                            </td>
                            <td>
                                {this.getTotal("nbCommentaires")}
                            </td>
                            <td>
                                {this.computeRate(this.getTotal("nbCommentaires"), this.getTotal("formValidated"))}
                            </td>
                            <td>
                                {this.getTotal("nbCommentairesRejected")}
                            </td>
                        </tr>
                        {
                            campaignStats.map((a, index) => (
                                <tr key={index}>
                                    <th scope="row">
                                        {a._id}
                                    </th>
                                    <td>
                                        {a.date && moment(a.date).format("DD/MM/YYYY")}
                                    </td>
                                    <td>
                                        {a.mailSent}
                                    </td>
                                    <td>
                                        {a.mailOpen}
                                    </td>
                                    <td>
                                        {this.computeRate(a.mailOpen, a.mailSent)}
                                    </td>
                                    <td>
                                        {a.linkClick}
                                    </td>
                                    <td>
                                        {this.computeRate(a.linkClick, a.mailOpen)}
                                    </td>
                                    <td>
                                        {a.formValidated}
                                    </td>
                                    <td>
                                        {this.computeRate(a.formValidated, a.mailSent)}
                                    </td>
                                    <td>
                                        {a.nbCommentaires}
                                    </td>
                                    <td>
                                        {this.computeRate(a.nbCommentaires, a.formValidated)}
                                    </td>
                                    <td>
                                        {a.nbCommentairesRejected}
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}

