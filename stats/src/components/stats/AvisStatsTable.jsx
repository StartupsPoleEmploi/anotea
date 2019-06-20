import React, { Component } from 'react';
import { getAvis } from '../../services/statsService';
import Loader from '../common/Loader';
import './StatsTable.scss';

export default class AvisStatsTable extends Component {

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
            <table className="StatsTable table table-hover">
                <thead>
                    <tr className="column-name">
                        <th colSpan="1">Régions</th>
                        <th colSpan="2">Stagiaires</th>
                        <th colSpan="4">Mails</th>
                        <th colSpan="2">Avis déposés</th>
                        <th colSpan="4">Commentaires</th>
                    </tr>
                    <tr className="column-subname">
                        <th scope="col"></th>
                        <th scope="col">Importés</th>
                        <th scope="col">Contactés</th>
                        <th scope="col">Envoyés</th>
                        <th scope="col">Ouverts</th>
                        <th scope="col">Cliqués</th>
                        <th scope="col">Validés</th>
                        <th scope="col">Total</th>
                        <th scope="col">Com</th>
                        <th scope="col">À</th>
                        <th scope="col">Positif/neutre</th>
                        <th scope="col">Neg.</th>
                        <th scope="col">Rejetés</th>
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
        );
    }
}

