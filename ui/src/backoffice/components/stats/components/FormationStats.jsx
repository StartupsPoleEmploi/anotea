import React from 'react';
import PropTypes from 'prop-types';
import './Stats.scss';
import { percentage } from '../../../services/statsService';

export default class FormationStats extends React.Component {

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
                            Formations
                        </div>
                        <div className="description">(source Intercarif)</div>
                    </div>
                    <div className="d-flex justify-content-between flex-wrap">
                        <div className="stats">
                            <div className="name">Formations en ligne</div>
                            <div className="value">{current.api.nbSessions}</div>
                        </div>
                        <div className="stats">
                            <div className="name">Formation avec un avis</div>
                            <div>
                                <span className="value highlighted">
                                    {percentage(current.api.nbSessionsAvecAvis, current.api.nbSessions)}
                                </span>
                                {regional &&
                                <span className="value compare">
                                    {percentage(national.nbSessionsAvecAvis, national.nbSessions)}*
                                </span>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className="details">
                    <div className="stats">
                        <div className="name">Nombre d'avis moyen par session</div>
                        <div className="value">{current.api.nbAvisParSession}</div>
                    </div>
                </div>
            </div>
        );
    }
}
