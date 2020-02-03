import React from 'react';
import PropTypes from 'prop-types';
import './Stats.scss';
import { avg, percentage } from '../../../services/statsService';

export default class FormationStats extends React.Component {

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
                            Formations
                        </div>
                        <div className="description">(source Intercarif)</div>
                    </div>
                    <div className="d-flex justify-content-between flex-wrap">
                        <div className="stats">
                            <div className="name">Formations en ligne</div>
                            <div className="value">{avg(stats, type, 'api.nbSessions')}</div>
                        </div>
                        <div className="stats">
                            <div className="name">Formation avec un avis</div>
                            <div>
                                <span className="value highlighted">
                                    {percentage(avg(stats, type, 'api.nbSessionsAvecAvis'), avg(stats, type, 'api.nbSessions'))}
                                </span>
                                {type === 'regional' &&
                                <span className="value compare">
                                    {percentage(avg(stats, 'national', 'api.nbSessionsAvecAvis'), avg(stats, 'national', 'api.nbSessions'))}*
                                </span>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className="details">
                    <div className="stats">
                        <div className="name">Nombre d'avis moyen par session</div>
                        <div className="value">{avg(stats, type, 'api.nbAvisParSession')}</div>
                    </div>
                </div>
            </div>
        );
    }
}
