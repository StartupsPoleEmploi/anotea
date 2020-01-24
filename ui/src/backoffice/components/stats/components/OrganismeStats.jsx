import React from 'react';
import PropTypes from 'prop-types';
import './Stats.scss';
import { latest, percentage } from '../../../services/statsService';

export default class OrganismeStats extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
        stats: PropTypes.object.isRequired,
    };

    render() {
        let regional = this.props.stats.organismes.regional;
        let national = this.props.stats.organismes.national;
        let stats = regional || national;

        let avis = this.props.stats.avis;
        let avisStats = avis.regional || avis.national;

        return (
            <div className="Stats">
                <div className="main d-flex flex-column">
                    <div className="title">
                        <div>
                            <i className="fas fa-graduation-cap a-icon"></i>
                            Organismes
                        </div>
                    </div>
                    <div className="d-flex justify-content-between flex-wrap">
                        <div className="stats">
                            <div className="name">Nombre</div>
                            <div className="value">{latest(stats.organismesActifs)}</div>
                        </div>
                        <div className="stats">
                            <div className="name">Avis répondus</div>
                            <div className="value">{latest(stats.nbReponses)}</div>
                        </div>
                        <div className="stats">
                            <div className="name">Taux réponse</div>
                            <div>
                                <span className="value highlighted">
                                    {percentage(latest(stats.nbReponses), latest(avisStats.nbQuestionnairesValidees))}
                                </span>
                                {regional &&
                                <span className="value compare ml-3">
                                    {percentage(latest(national.nbReponses), latest(avisStats.nbQuestionnairesValidees))}*
                                </span>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
