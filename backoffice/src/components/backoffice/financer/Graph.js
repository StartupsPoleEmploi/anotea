import React from 'react';
import { Pie } from 'react-chartjs-2';
import PropTypes from 'prop-types';

import {
    getDashboardData,
    getGraphData
} from '../../../lib/mailStatsService';

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

    render() {
        return (
            <div>
                <table>
                    <tr>
                        <td>label</td><td>{this.state.dashboardData.count}</td>
                        <td>label</td><td>{this.state.dashboardData.countOpen}</td>
                        <td>label</td><td>{this.state.dashboardData.countAdvices}</td>
                        <td>label</td><td>{this.state.dashboardData.countAdvicesPositif}</td>
                        <td>label</td><td>{this.state.dashboardData.countAdvicesNegatif}</td>
                        <td>label</td><td>{this.state.dashboardData.countAdvicesRejected}</td>
                    </tr>
                </table>

            </div>
        );
    }

}
