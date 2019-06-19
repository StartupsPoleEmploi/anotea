import React, { Component } from 'react';
import './StatsTable.scss';

export default class OrganismesStatsTable extends Component {

    render() {

        return (
            <div className="container table-responsive">
                <table className="table">
                    <thead>
                        <tr className="table-colspan">
                            {this.props.variant.map(e => (
                                <th key={e.id} colSpan={e.value}>{e.title}</th>
                            ))}
                        </tr>
                        <tr>
                            {this.props.columnsTitle.map(title => (
                                <th key={title.id} scope="col">{title.value}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {(this.props.isOrganismes ?
                                (this.props.organismes.map((organisme, index) => (
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
                                ))) :
                                (this.props.avis.map((avis, index) => (
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
                                )))
                        )}
                    </tbody>
                </table>
            </div>
        );
    }
}

