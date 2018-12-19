import React from 'react';
import PropTypes from 'prop-types';

import { getDashboardData } from '../../../../lib/mailStatsService';

import './table.css';

export default class Graph extends React.Component {

    state = {
        dashboardData: {}
    };

    static propTypes = {
        codeRegion: PropTypes.string.isRequired,
        codeFinanceur: PropTypes.string.isRequired,
        changeType: PropTypes.func.isRequired,
        type: PropTypes.number.isRequired,
        year: PropTypes.number.isRequired
    }

    constructor(props) {
        super(props);

        getDashboardData(props.codeRegion, props.year, props.codeFinanceur === '4' ? 'all' : props.codeFinanceur).then(dashboardData => {
            this.setState({ dashboardData: dashboardData });
        });
    }

    componentWillReceiveProps(nextProps) {
        getDashboardData(nextProps.codeRegion, nextProps.year, nextProps.codeFinanceur === '4' ? 'all' : nextProps.codeFinanceur).then(dashboardData => {
            this.setState({ dashboardData: dashboardData });
        });
    }

    getRate = (value, total) => `${(value / total * 100).toFixed(2).replace('.', ',')} %`;

    render() {
        return (
            <div>
                { Object.keys(this.state.dashboardData).length === 0 &&
                    <div className="alert alert-warning">
                        Pas de statistiques pour cette période.
                    </div>
                }

                { Object.keys(this.state.dashboardData).length > 0 &&
                    <table className="table table-striped">
                        <tbody>
                            <tr className={this.props.type === 0 ? 'selected' : ''}>
                                <td onClick={this.props.changeType.bind(this, 0)}>Nombre de mails envoyés</td>
                                <td className="value">{this.state.dashboardData.count}</td>
                            </tr>
                            <tr className={this.props.type === 1 ? 'selected' : ''}>
                                <td onClick={this.props.changeType.bind(this, 1)}>Tx d'ouverture des mails</td>
                                <td className="value">{this.getRate(this.state.dashboardData.countEmailOpen, this.state.dashboardData.count)}</td>
                            </tr>
                            <tr className={this.props.type === 2 ? 'selected' : ''}>
                                <td onClick={this.props.changeType.bind(this, 2)}>Tx d'avis déposés</td>
                                <td className="value">{this.getRate(this.state.dashboardData.countAdvicesPublished, this.state.dashboardData.count)}</td>
                            </tr>
                            <tr className={this.props.type === 3 ? 'selected' : ''}>
                                <td onClick={this.props.changeType.bind(this, 3)}>Tx d'avis avec commentaires</td>
                                <td className="value">{this.getRate(this.state.dashboardData.countAdvicesWithComments, this.state.dashboardData.countAdvicesPublished)}</td>
                            </tr>
                            <tr className={this.props.type === 4 ? 'selected' : ''}>
                                <td onClick={this.props.changeType.bind(this, 4)}>Tx de commentaires positifs ou neutres</td>
                                <td className="value">{this.getRate(this.state.dashboardData.countAdvicesPositif, this.state.dashboardData.countAdvicesWithComments)}</td>
                            </tr>
                            <tr className={this.props.type === 5 ? 'selected' : ''}>
                                <td onClick={this.props.changeType.bind(this, 5)}>Tx de commentaires négatifs</td>
                                <td className="value">{this.getRate(this.state.dashboardData.countAdvicesNegatif, this.state.dashboardData.countAdvicesWithComments)}</td>
                            </tr>
                            <tr className={this.props.type === 6 ? 'selected' : ''}>
                                <td onClick={this.props.changeType.bind(this, 6)}>Tx de commentaires rejetés</td>
                                <td className="value">{this.getRate(this.state.dashboardData.countAdvicesRejected, this.state.dashboardData.countAdvicesWithComments)}</td>
                            </tr>
                        </tbody>
                    </table>
                }

            </div>
        );
    }

}