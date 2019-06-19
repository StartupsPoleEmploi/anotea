import React, { Component } from 'react';
import { getOrganismes } from '../../services/statsService';
import Loader from '../common/Loader';
import './StatsTable.scss';

let titles = [
    { id: 1, value: '' },
    { id: 2, value: 'Total' },
    { id: 3, value: 'Total' },
    { id: 4, value: 'Ouverts' },
    { id: 5, value: 'Cliqués' },
    { id: 6, value: 'Actifs' },
    { id: 8, value: 'Non lus' },
    { id: 9, value: 'Répondus' },
    { id: 10, value: 'Avec rép.' },
    { id: 12, value: 'Signalés' },
];
let colspans = [
    { id: 1, value: 1, title: 'Régions' },
    { id: 2, value: 1, title: 'OF contactés' },
    { id: 3, value: 3, title: 'Mails envoyés' },
    { id: 4, value: 1, title: 'Comptes' },
    { id: 5, value: 5, title: 'Avis' },
];

export default class OrganismesStats extends Component {

    constructor(props) {
        super(props);

        this.state = {
            results: []
        };
    }

    async componentDidMount() {
        this.setState({ results: await getOrganismes() });
    }

    render() {

        let { results } = this.state;

        if (results.length === 0) {
            return <Loader />;
        }

        return (
            <div className="container table-responsive">
                <table className="table">
                    <thead>
                        <tr className="table-colspan">
                            {colspans.map(e => (
                                <th key={e.id} colSpan={e.value}>{e.title}</th>
                            ))}
                        </tr>
                        <tr>
                            {titles.map(title => (
                                <th key={title.id} scope="col">{title.value}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {
                            results.map((organisme, index) => (
                                <tr key={index}>
                                    <th scope="row">{organisme.regionName}</th>
                                    <td>{organisme.nbOrganismesContactes}</td>
                                    <td>{organisme.mailsEnvoyes}</td>
                                    <td>{organisme.tauxOuvertureMails}</td>
                                    <td>{organisme.tauxClicDansLien}</td>
                                    <td>{organisme.tauxOrganismesActifs}</td>
                                    <td>{organisme.tauxAvisNonLus}</td>
                                    <td>{organisme.tauxCommentairesAvecReponses}</td>
                                    <td>{organisme.tauxAvisAvecReponses}</td>
                                    <td>{organisme.tauxAvisSignales}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}

