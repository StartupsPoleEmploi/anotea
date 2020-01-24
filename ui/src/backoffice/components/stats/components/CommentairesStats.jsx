import React from 'react';
import PropTypes from 'prop-types';
import './Stats.scss';
import { latest, percentage } from '../../../services/statsService';

export default class CommentairesStats extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
        stats: PropTypes.object.isRequired,
    };

    render() {
        let regional = this.props.stats.avis.regional;
        let national = this.props.stats.avis.national;
        let stats = regional || national;

        return (
            <div className="Stats">
                <div className="main with-details d-flex flex-column">
                    <div className="title">
                        <div>
                            <i className="fas fa-sign-out-alt a-icon"></i>
                            Commentaires
                        </div>
                    </div>
                    <div className="d-flex justify-content-between flex-wrap">
                        <div className="stats">
                            <div className="name">Commentaires</div>
                            <div className="value">{latest(stats.nbAvisAvecCommentaire)}</div>
                        </div>
                        <div className="stats">
                            <div className="name">Taux</div>
                            <div>
                                <span className="value highlighted">
                                    {percentage(latest(stats.nbAvisAvecCommentaire), latest(stats.nbQuestionnairesValidees))}
                                </span>
                                {regional &&
                                <span className="value compare ml-3">
                                    {percentage(latest(national.nbAvisAvecCommentaire), latest(national.nbQuestionnairesValidees))}*
                                </span>
                                }
                            </div>

                        </div>
                    </div>
                </div>
                <div className="d-flex justify-content-between">
                    <div className="details">
                        <div className="stats">
                            <div className="name">Positifs ou neutres</div>
                            <div className="value">
                                {latest(stats.nbCommentairesPositifs)}
                            </div>
                        </div>
                    </div>
                    <div className="details">
                        <div className="stats">
                            <div className="name">Négatifs</div>
                            <div className="value">
                                {latest(stats.nbCommentairesNegatifs)}
                            </div>
                        </div>
                    </div>
                    <div className="details">
                        <div className="stats">
                            <div className="name">Rejetés</div>
                            <div className="value">
                                {latest(stats.nbCommentairesRejetes)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
