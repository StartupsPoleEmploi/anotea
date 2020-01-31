import React from 'react';
import PropTypes from 'prop-types';
import './Stats.scss';
import { percentage } from '../../../services/statsService';

export default class CommentairesStats extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
        stats: PropTypes.object.isRequired,
    };

    render() {
        let { stats } = this.props;
        let latest = stats[0];
        let regional = latest.regional;
        let national = latest.national;
        let current = regional || national;

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
                            <div className="value">{current.avis.nbAvisAvecCommentaire}</div>
                        </div>
                        <div className="stats">
                            <div className="name">Taux</div>
                            <div>
                                <span className="value highlighted">
                                    {percentage(current.avis.nbAvisAvecCommentaire, current.avis.nbAvis)}
                                </span>
                                {regional &&
                                <span className="value compare">
                                    {percentage(national.avis.nbAvisAvecCommentaire, national.avis.nbAvis)}*
                                </span>
                                }
                            </div>

                        </div>
                    </div>
                </div>
                <div className="details">
                    <div className="stats">
                        <div className="name">Positifs ou neutres</div>
                        <span className="value">
                            {percentage(current.avis.nbCommentairesPositifs, current.avis.nbAvisAvecCommentaire)}
                        </span>
                        {regional &&
                        <span className="value compare">
                            {percentage(national.avis.nbCommentairesPositifs, national.avis.nbAvisAvecCommentaire)}*
                        </span>
                        }
                    </div>
                    <div className="stats">
                        <div className="name">Négatifs</div>
                        <span className="value">
                            {percentage(current.avis.nbCommentairesNegatifs, current.avis.nbAvisAvecCommentaire)}
                        </span>
                        {regional &&
                        <span className="value compare">
                            {percentage(national.avis.nbCommentairesNegatifs, national.avis.nbAvisAvecCommentaire)}*
                        </span>
                        }
                    </div>
                    <div className="stats">
                        <div className="name">Rejetés</div>
                        <span className="value">
                            {percentage(current.avis.nbCommentairesRejetes, current.avis.nbAvisAvecCommentaire)}
                        </span>
                        {regional &&
                        <span className="value compare">
                            {percentage(national.avis.nbCommentairesRejetes, national.avis.nbAvisAvecCommentaire)}*
                        </span>
                        }
                    </div>
                </div>
            </div>
        );
    }
}
