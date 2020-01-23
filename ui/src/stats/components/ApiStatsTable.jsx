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
            showNotes: true,
        };
    }

    computeRate(dividend, divisor) {
        return this.state.showNotes ? calculateRate(dividend, divisor) : dividend;
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
                                    name="showNotes"
                                    type="checkbox"
                                    checked={this.state.showNotes}
                                    onChange={() => this.setState({ showNotes: !this.state.showNotes })} />
                                <span> Taux</span>
                            </div>
                        </th>
                        <th scope="col" className="section">
                            <span>Total</span>
                            <i className="fas fa-question-circle">
                                <span className="tooltip">Total avis recueillis</span>
                            </i>
                        </th>
                        <th scope="col">
                            <span>Restitués</span>
                            <i className="fas fa-question-circle">
                                <span className="tooltip">Avis pour lesquels une session similaire est en ligne (restitués par l&apos;API)</span>
                            </i>
                        </th>
                        <th scope="col" className="section">
                            <span>Total</span>
                            <i className="fas fa-question-circle">
                                <span className="tooltip">Nombre de sessions en ligne sur l&apos;InterCarif</span>
                            </i>
                        </th>
                        <th scope="col">
                            <span>Avec avis</span>
                            <i className="fas fa-question-circle">
                                <span className="tooltip">Nombre de sessions en ligne avec avis</span>
                            </i>
                        </th>
                        <th scope="col">
                            <span>Certifiantes avec avis</span>
                            <i className="fas fa-question-circle">
                                <span className="tooltip">Nombre de sessions certifiantes avec avis</span>
                            </i>
                        </th>
                        <th scope="col">
                            <span>Nb avis par session</span>
                            <i className="fas fa-question-circle">
                                <span className="tooltip">Nombre moyen d&apos;avis par session</span>
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

