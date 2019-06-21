import React, { Component } from 'react';
import PropTypes from 'prop-types';
import calculateRate from './utils/calculateRate';
import './StatsTable.scss';

export default class ApiStatsTable extends Component {

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
                        <th colSpan="2">Avis</th>
                        <th colSpan="4">Sessions</th>
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
                        <th scope="col">Restituables</th>
                        <th scope="col" className="section">Total</th>
                        <th scope="col">Réconciliées avec avis</th>
                        <th scope="col">Réconciliées avec avis (certifiantes)</th>
                        <th scope="col">Nb avis par session</th>
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
                                    {a.nbAvis}
                                </td>
                                <td>
                                    {this.computeRate(a.nbAvisRestituables, a.nbAvis)}
                                </td>
                                <td className="section">
                                    {a.nbSessions}
                                </td>
                                <td>
                                    {this.computeRate(a.nbSessionsAvecAvis, a.nbSessions)}
                                </td>
                                <td>
                                    {this.computeRate(a.nbSessionsCertifiantesAvecAvis, a.nbSessions)}
                                </td>
                                <td>
                                    {a.nbAvisParSession}
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        );
    }
}

