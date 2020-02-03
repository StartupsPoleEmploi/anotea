import React from 'react';
import PropTypes from 'prop-types';
import './Stats.scss';
import { diff, percentage } from '../../../services/statsService';

export default class CommentairesStats extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
        stats: PropTypes.array.isRequired,
    };

    render() {
        let { query, stats } = this.props;
        let type = query.codeRegion ? 'regional' : 'national';

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
                            <div className="value">{diff(stats, type, 'avis.nbAvisAvecCommentaire')}</div>
                        </div>
                        <div className="stats">
                            <div className="name">Taux</div>
                            <div>
                                <span className="value highlighted">
                                    {percentage(diff(stats, type, 'avis.nbAvisAvecCommentaire'), diff(stats, type, 'avis.nbAvis'))}
                                </span>
                                {type === 'regional' &&
                                <span className="value compare">
                                    {percentage(diff(stats, 'national', 'avis.nbAvisAvecCommentaire'), diff(stats, 'national', 'avis.nbAvis'))}*
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
                            {percentage(diff(stats, type, 'avis.nbCommentairesPositifs'), diff(stats, type, 'avis.nbAvisAvecCommentaire'))}
                        </span>
                        {type === 'regional' &&
                        <span className="value compare">
                            {percentage(diff(stats, 'national', 'avis.nbCommentairesPositifs'), diff(stats, 'national', 'avis.nbAvisAvecCommentaire'))}*
                        </span>
                        }
                    </div>
                    <div className="stats">
                        <div className="name">Négatifs</div>
                        <span className="value">
                            {percentage(diff(stats, type, 'avis.nbCommentairesNegatifs'), diff(stats, type, 'avis.nbAvisAvecCommentaire'))}
                        </span>
                        {type === 'regional' &&
                        <span className="value compare">
                            {percentage(diff(stats, 'national', 'avis.nbCommentairesNegatifs'), diff(stats, 'national', 'avis.nbAvisAvecCommentaire'))}*
                        </span>
                        }
                    </div>
                    <div className="stats">
                        <div className="name">Rejetés</div>
                        <span className="value">
                            {percentage(diff(stats, type, 'avis.nbCommentairesRejetes'), diff(stats, type, 'avis.nbAvisAvecCommentaire'))}
                        </span>
                        {type === 'regional' &&
                        <span className="value compare">
                            {percentage(diff(stats, 'national', 'avis.nbCommentairesRejetes'), diff(stats, 'national', 'avis.nbAvisAvecCommentaire'))}*
                        </span>
                        }
                    </div>
                </div>
            </div>
        );
    }
}
