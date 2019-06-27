import React, { Component } from 'react';
import PropTypes from 'prop-types';
import calculateRate from './utils/calculateRate';
import './StatsTable.scss';

export default class OrganismesStatsTable extends Component {

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
                        <th colSpan="1">Contactés</th>
                        <th colSpan="3">Mails envoyés</th>
                        <th colSpan="1">Comptes</th>
                        <th colSpan="5">Avis</th>
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
                        <th scope="col" className="section">Total</th>
                        <th scope="col" className="section">Total</th>
                        <th scope="col">Ouverts <i className="fas fa-question-circle"><span className="tooltip">Taux d&apos;ouverture de mail</span></i></th>
                        <th scope="col">Cliqués <i className="fas fa-question-circle"><span className="tooltip">Taux de clic dans le lien</span></i></th>
                        <th scope="col" className="section">Actifs <i className="fas fa-question-circle"><span className="tooltip">Taux des organismes actifs</span></i></th>
                        <th scope="col" className="section">Non lus <i className="fas fa-question-circle"><span className="tooltip">Taux des avis non lus par les OF</span></i></th>
                        <th scope="col">Répondus <i className="fas fa-question-circle"><span className="tooltip">Total des avis avec réponse</span></i></th>
                        <th scope="col">Signalés <i className="fas fa-question-circle"><span className="tooltip">Taux des avis signalés</span></i></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        stats.map((o, index) => (
                            <tr key={index}>
                                <th scope="row">{o.label}</th>
                                <td className="section">{o.nbOrganismesContactes}</td>
                                <td className="section">{o.mailsEnvoyes}</td>
                                <td>
                                    {this.computeRate(o.ouvertureMails, o.nbOrganismesContactes)}
                                </td>
                                <td>
                                    {this.computeRate(o.nbClicDansLien, o.ouvertureMails)}
                                </td>
                                <td className="section">
                                    {this.computeRate(o.organismesActifs, o.nbOrganismesContactes)}
                                </td>
                                <td className="section">
                                    {this.computeRate(o.avisNonLus, o.avisModeresNonRejetes)}
                                </td>
                                <td>
                                    {o.nbReponses + o.avisModeresNonRejetes}
                                </td>
                                <td>
                                    {this.computeRate(o.avisSignales, o.avisModeresNonRejetes)}
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        );
    }
}

