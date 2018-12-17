import React from 'react';
import { Pie } from 'react-chartjs-2';
import PropTypes from 'prop-types';

import {
    getDashboardData,
    getGraphData
} from '../../../../lib/mailStatsService';

export default class Graph extends React.Component {

    state = {
        dashboardData: []
    };

    static propTypes = {
        codeRegion: PropTypes.string.isRequired,
        codeFinanceur: PropTypes.string.isRequired
    }

    constructor(props) {
        super(props);

        getDashboardData(props.codeRegion, new Date().getFullYear(), props.codeFinanceur).then(dashboardData => {
            this.setState({ dashboardData: dashboardData });
        });
    }

    getRate = (value, total) => `${(value / total * 100).toFixed(2)} %`;

    render() {
        return (
            <div>
                <table className="table table-striped">
                    <tbody>
                        <tr>
                            <td>Nombre de mails envoyés</td><td>{this.state.dashboardData.count}</td>
                        </tr>
                        <tr>
                            <td>Tx d'ouverture des mails</td><td>{this.getRate(this.state.dashboardData.countEmailOpen, this.state.dashboardData.count)}</td>
                        </tr>
                        <tr>
                            <td>Tx d'avis déposés</td><td>{this.getRate(this.state.dashboardData.countAdvicesPublished, this.state.dashboardData.countEmailOpen)}</td>
                        </tr>
                        <tr>
                            <td>Tx d'avis avec commentaires</td><td>{this.getRate(this.state.dashboardData.countAdvicesWithComments, this.state.dashboardData.countAdvicesPublished)}</td>
                        </tr>
                        <tr>
                            <td>Tx de commentaires positifs ou neutres</td><td>{this.getRate(this.state.dashboardData.countAdvicesPositif, this.state.dashboardData.countAdvicesWithComments)}</td>
                        </tr>
                        <tr>
                            <td>Tx de commentaires négatifs</td><td>{this.getRate(this.state.dashboardData.countAdvicesNegatif, this.state.dashboardData.countAdvicesWithComments)}</td>
                        </tr>
                        <tr>
                            <td>Tx de commentaires rejetés</td><td>{this.getRate(this.state.dashboardData.countAdvicesRejected, this.state.dashboardData.countAdvicesWithComments)}</td>
                        </tr>
                    </tbody>
                </table>

            </div>
        );
    }

}
