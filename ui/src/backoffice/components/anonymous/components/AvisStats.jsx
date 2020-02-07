import React from 'react';
import PropTypes from 'prop-types';
import './Stats.scss';
import { latest } from '../../../services/statsService';
import { formatNumber, percentage } from '../../../utils/number-utils';

export default class AvisStats extends React.Component {

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
                            <i className="far fa-comment-alt a-icon"></i>
                            Avis
                        </div>
                    </div>
                    <div className="d-flex justify-content-between flex-wrap">
                        <div className="stats">
                            <div className="name">Total avis déposés</div>
                            <div className="value">{formatNumber(latest(stats, type, 'avis.nbAvis'))}</div>
                        </div>
                        <div className="stats">
                            <div className="name">Commentaires</div>
                            <div className="value">
                                {formatNumber(latest(stats, type, 'avis.nbAvisAvecCommentaire'))}
                            </div>
                        </div>
                        <div className="stats">
                            <div className="name">Taux</div>
                            <div>
                                <span className="value highlighted">
                                    {percentage(latest(stats, type, 'avis.nbAvisAvecCommentaire'), latest(stats, type, 'avis.nbAvis'))}%
                                </span>
                                {type === 'regional' &&
                                <span className="value compare">
                                    {percentage(latest(stats, 'national', 'avis.nbAvisAvecCommentaire'), latest(stats, 'national', 'avis.nbAvis'))}%*
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
                            {percentage(latest(stats, type, 'avis.nbCommentairesPositifs'), latest(stats, type, 'avis.nbAvisAvecCommentaire'))}%
                        </span>
                        {type === 'regional' &&
                        <span className="value compare">
                            {percentage(latest(stats, 'national', 'avis.nbCommentairesPositifs'), latest(stats, 'national', 'avis.nbAvisAvecCommentaire'))}%*
                        </span>
                        }
                    </div>
                    <div className="stats">
                        <div className="name">Négatifs</div>
                        <span className="value">
                            {percentage(latest(stats, type, 'avis.nbCommentairesNegatifs'), latest(stats, type, 'avis.nbAvisAvecCommentaire'))}%
                        </span>
                        {type === 'regional' &&
                        <span className="value compare">
                            {percentage(latest(stats, 'national', 'avis.nbCommentairesNegatifs'), latest(stats, 'national', 'avis.nbAvisAvecCommentaire'))}%*
                        </span>
                        }
                    </div>
                    <div className="stats">
                        <div className="name">Rejetés</div>
                        <span className="value">
                            {percentage(latest(stats, type, 'avis.nbCommentairesRejetes'), latest(stats, type, 'avis.nbAvisAvecCommentaire'))}%
                        </span>
                        {type === 'regional' &&
                        <span className="value compare">
                            {percentage(latest(stats, 'national', 'avis.nbCommentairesRejetes'), latest(stats, 'national', 'avis.nbAvisAvecCommentaire'))}%*
                        </span>
                        }
                    </div>
                </div>
            </div>
        );
    }
}
