import React from 'react';
import PropTypes from 'prop-types';

import { getDashboardData } from '../../../../lib/mailStatsService';

import './table.css';

export default class Graph extends React.Component {

    state = {
        dashboardData: {},
        tableContent: []
    };

    static propTypes = {
        codeRegion: PropTypes.string.isRequired,
        codeFinanceur: PropTypes.string.isRequired,
        changeType: PropTypes.func.isRequired,
        type: PropTypes.number.isRequired,
        year: PropTypes.number.isRequired,
        index: PropTypes.number.isRequired
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

            let accumulator = Object.values(dashboardData).reduce((accumulator, value) => {
                return accumulator + value;
            }, 0);

            this.setState({
                isEmpty: accumulator === 0, dashboardData: dashboardData, tableContent: [
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
                        label: 'Nombre d\'avis modérés',
                        value: dashboardData.countAdvicesModerated
                    },
                    {
                        type: 2,
                        label: 'Taux d\'avis modérés',
                        value: this.getRate(dashboardData.countAdvicesModerated, dashboardData.count)
                    },
                    {
                        type: 3,
                        label: 'Taux d\'avis avec commentaires',
                        value: this.getRate(dashboardData.countAdvicesWithComments, dashboardData.count)
                    },
                    {
                        type: 4,
                        label: 'Taux de commentaires positifs ou neutres',
                        value: this.getRate(dashboardData.countAdvicesPositif, dashboardData.countAdvicesModerated)
                    },
                    {
                        type: 5,
                        label: 'Taux de commentaires négatifs',
                        value: this.getRate(dashboardData.countAdvicesNegatif, dashboardData.countAdvicesModerated)
                    },
                    {
                        type: 6,
                        label: 'Taux de commentaires rejetés',
                        value: this.getRate(dashboardData.countAdvicesRejected, dashboardData.countAdvicesModerated)
                    },
                    {
                        type: 7,
                        label: 'Nombre de sessions diffusées',
                        value: dashboardData.countSessions
                    },
                    {
                        type: 8,
                        label: 'Nombre de sessions avec avis',
                        value: dashboardData.countSessionsWithAdvices
                    },
                    {
                        type: 9,
                        label: 'Taux de sessions avec au moins un avis',
                        value: this.getRate(dashboardData.countSessionsWithAdvices, dashboardData.countSessions)
                    },
                    {
                        type: 10,
                        label: 'Taux de sessions avec au moins trois avis',
                        value: this.getRate(dashboardData.countSessionsWithMoreThanTwoAdvices, dashboardData.countSessions)
                    },
                    {
                        type: 11,
                        label: 'Nombre d\'organismes de formation',
                        value: dashboardData.countOrganisme
                    },
                    {
                        type: 12,
                        label: 'Taux d\'organismes de formation avec au moins un avis',
                        value: this.getRate(dashboardData.countOrganismeWithMorethanOneAdvice, dashboardData.countOrganisme)
                    },
                    {
                        type: 13,
                        label: 'Taux d\'organismes de formation connectés dans les trois derniers mois',
                        value: this.getRate(dashboardData.countOrganismeLogin, dashboardData.countOrganismeWithMorethanOneAdvice)
                    }
                ]
            });
        });
    }

    getRate = (value, total) => {
        const result = `${(value / total * 100).toFixed(2).replace('.', ',')} %`;
        return isNaN(value / total) ? '-' : result;
    }

    isEmpty = () => Object.keys(this.state.dashboardData).length === 0 || this.state.isEmpty;

    render() {
        return (
            <div>
                {this.isEmpty() &&
                <div className="alert alert-warning">
                    Pas de statistiques pour cette période.
                </div>
                }

                {!this.isEmpty() &&
                <table className="table table-striped">
                    <tbody>
                        {this.state.tableContent.map((content, index) =>
                            <tr key={index} className={this.props.index === index ? 'selected' : ''}>
                                <td onClick={this.props.changeType.bind(this, content.type, index)}>{content.label}</td>
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
