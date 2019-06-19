import React, { Component } from 'react';
import { getAvis } from '../../services/statsService';
import Loader from '../common/Loader';
import './StatsTable.scss';

let titles = [
    { id: 1, value: '' },
    { id: 2, value: 'Importés' },
    { id: 3, value: 'Contactés' },
    { id: 4, value: 'Envoyés' },
    { id: 5, value: 'Ouverts' },
    { id: 6, value: 'Cliqués' },
    { id: 7, value: 'Validés' },
    { id: 8, value: 'Total' },
    { id: 9, value: 'Com.' },
    { id: 10, value: 'À modérer' },
    { id: 11, value: 'Positif/neutre' },
    { id: 12, value: 'Neg.' },
    { id: 13, value: 'Rejetés' },
];
let colspans = [
    { id: 1, value: 1, title: 'Régions & campagne' },
    { id: 2, value: 2, title: 'Stagiaires' },
    { id: 3, value: 4, title: 'Mails' },
    { id: 4, value: 2, title: 'Avis déposés' },
    { id: 5, value: 4, title: 'Commentaires' },
];

export default class AvisStats extends Component {

    constructor(props) {
        super(props);

        this.state = {
            results: []
        };
    }

    async componentDidMount() {
        this.setState({ results: await getAvis() });
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
                            results.map((avis, index) => (
                                <tr key={index}>
                                    <th scope="row">{avis.regionName}</th>
                                    <td>TODO</td>
                                    <td>{avis.nbStagiairesContactes}</td>
                                    <td>{avis.nbMailEnvoyes}</td>
                                    <td>{avis.tauxOuvertureMail}</td>
                                    <td>{avis.tauxLiensCliques}</td>
                                    <td>{avis.tauxQuestionnairesValides}</td>
                                    <td>{avis.tauxAvisDeposes}</td>
                                    <td>{avis.tauxAvisAvecCommentaire}</td>
                                    <td>{avis.nbCommentairesAModerer}</td>
                                    <td>{avis.tauxAvisPositifs}</td>
                                    <td>{avis.tauxAvisNegatifs}</td>
                                    <td>{avis.tauxAvisRejetes}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}

