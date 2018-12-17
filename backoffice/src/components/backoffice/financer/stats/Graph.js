import React from 'react';
import { Line } from 'react-chartjs-2';
import PropTypes from 'prop-types';

import {
    getGraphData
} from '../../../../lib/mailStatsService';

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export default class Graph extends React.Component {

    state = {
        allData: [],
        graphData: []
    };

    static propTypes = {
        codeRegion: PropTypes.string.isRequired,
        codeFinanceur: PropTypes.string.isRequired,
        type: PropTypes.number.isRequired
    }

    constructor(props) {
        super(props);
        getGraphData(props.codeRegion, new Date().getFullYear(), props.codeFinanceur).then(graphData => {

            const allData = [
                { label: 'Nombre de mails envoyés', data: graphData.map(item => item.count) },
                { label: 'Nombre de mails ouverts', data: graphData.map(item => item.countEmailOpen) },
                { label: 'Nombre d\'avis déposés', data: graphData.map(item => item.countAdvicesPublished) },
                { label: 'Nombre d\'avis avec commentaires', data: graphData.map(item => item.countAdvicesWithComments) },
                { label: 'Nombre de commentaires positifs ou neutres', data: graphData.map(item => item.countAdvicesPositif) },
                { label: 'Nombre de commentaires négatifs', data: graphData.map(item => item.countAdvicesNegatif) },
                { label: 'Nombre de commentaires rejetés', data: graphData.map(item => item.countAdvicesRejected) }
            ];

            this.setState({
                allData: allData,
                graphData: {
                    labels: MONTHS,
                    datasets: [
                        allData[props.type]
                    ]
                }
            });
        });
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            graphData: {
                labels: MONTHS,
                datasets: [
                    this.state.allData[nextProps.type]
                ]
            }
        });
    }

    render() {
        return (
            <div>
                <Line data={this.state.graphData} />
            </div>
        );
    }

}
