import React from 'react';
import PropTypes from 'prop-types';

import { getDashboardData } from '../../../../lib/mailStatsService';

import './table.css';

export default class Graph extends React.Component {

    state = {
        dashboardData: {},
        tableContent : []
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

        this.updateDashboard(props);
    }

    componentWillReceiveProps(nextProps) {
        this.updateDashboard(nextProps);
    }


    updateDashboard = props => {
        getDashboardData(props.codeRegion, props.year, props.codeFinanceur === '4' ? 'all' : props.codeFinanceur).then(dashboardData => {
            this.setState({ dashboardData: dashboardData, tableContent: [
                {
                    type: 0,
                    label: 'Nombre de mails envoyés',
                    value: dashboardData.count
                },
                {
                    type: 1,
                    label: 'Taux d\'ouverture des mails',
                    value: this.getRate(dashboardData.countEmailOpen, dashboardData.count)
                },
                {
                    type: 2,
                    label: 'Taux d\'avis déposés',
                    value: this.getRate(dashboardData.countAdvicesPublished, dashboardData.count)
                },
                {
                    type: 3,
                    label: 'Taux d\'avis avec commentaires',
                    value: this.getRate(dashboardData.countAdvicesWithComments, dashboardData.countAdvicesPublished)
                },
                {
                    type: 4,
                    label: 'Taux de commentaires positifs ou neutres',
                    value: this.getRate(dashboardData.countAdvicesPositif, dashboardData.countAdvicesWithComments)
                },
                {
                    type: 5,
                    label: 'Taux de commentaires négatifs',
                    value: this.getRate(dashboardData.countAdvicesNegatif, dashboardData.countAdvicesWithComments)
                },
                {
                    type: 6,
                    label: 'Taux de commentaires rejetés',
                    value: this.getRate(dashboardData.countAdvicesRejected, dashboardData.countAdvicesWithComments)
                },
                {
                    type: 7,
                    label: 'Nombre de sessions diffusées',
                    value: this.getRate(dashboardData.countAdvicesRejected, dashboardData.countAdvicesWithComments)
                },
                {
                    type: 8,
                    label: 'Taux de commentaires rejetés',
                    value: this.getRate(dashboardData.countAdvicesRejected, dashboardData.countAdvicesWithComments)
                },
                {
                    type: 9,
                    label: 'Taux de sessions avec au moins un avis',
                    value: this.getRate(dashboardData.countAdvicesRejected, dashboardData.countAdvicesWithComments)
                },
                {
                    type: 10,
                    label: 'Taux de sessions avec au moins trois avis',
                    value: this.getRate(dashboardData.countAdvicesRejected, dashboardData.countAdvicesWithComments)
                },
                {
                    type: 11,
                    label: 'Nombre d\'organismes de formation',
                    value: this.getRate(dashboardData.countAdvicesRejected, dashboardData.countAdvicesWithComments)
                },
                {
                    type: 12,
                    label: 'Taux d\'organismes de formation avec au moins un avis',
                    value: this.getRate(dashboardData.countAdvicesRejected, dashboardData.countAdvicesWithComments)
                },
                {
                    type: 13,
                    label: 'Taux d\'organismes de formation connectés dans les trois derniers mois',
                    value: this.getRate(dashboardData.countAdvicesRejected, dashboardData.countAdvicesWithComments)
                }
            ] });
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
                            {this.state.tableContent.map(content =>
                                <tr key={content.type} className={this.props.type === content.type ? 'selected' : ''}>
                                    <td onClick={this.props.changeType.bind(this, content.type)}>{content.label}</td>
                                    <td className="value">{content.value}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                }

            </div>
        );
    }

}
