import React from 'react';
import PropTypes from 'prop-types';
import './Stats.scss';
import { diff } from '../../../services/statsService';
import { formatNumber, percentage } from '../../../utils/number-utils';

export default class OrganismeStats extends React.Component {
   
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
                    <h2 className="title" >
                        <span aria-hidden="true" className="far fa-comment-alt a-icon"></span>
                        Organismes
                    </h2>
                    <div className="d-flex justify-content-between flex-wrap">
                        <div className="stats" >
                            <div className="name">Organismes actifs</div>
                            <div className="value">{formatNumber(diff(stats, type, 'organismes.nbOrganismesActifs'))}</div>
                        </div>
                        <div className="stats" >
                            <div className="name">Taux de commentaires avec réponse</div>
                            <div>
                                <span className="value highlighted">
                                    {percentage(diff(stats, type, 'avis.nbReponses'), diff(stats, type, 'avis.nbAvisAvecCommentaire'))}%
                                </span>
                                {type === 'regional' &&
                                <span className="value compare">
                                    {percentage(diff(stats, 'national', 'avis.nbReponses'), diff(stats, 'national', 'avis.nbAvisAvecCommentaire'))}%*
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
