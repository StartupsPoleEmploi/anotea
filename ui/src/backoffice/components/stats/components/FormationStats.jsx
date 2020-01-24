import React from 'react';
import PropTypes from 'prop-types';
import './Stats.scss';
import { divide, latest, percentage } from '../../../services/statsService';

export default class FormationStats extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
        stats: PropTypes.object.isRequired,
    };

    render() {
        let regional = this.props.stats.api.regional;
        let national = this.props.stats.api.national;
        let stats = regional || national;

        return (
            <div className="Stats">
                <div className="main with-details d-flex flex-column">
                    <div className="title">
                        <div>
                            <i className="fas fa-sign-out-alt a-icon"></i>
                            Formations en ligne
                        </div>
                        <div className="description">Catalogue intercarif</div>
                    </div>
                    <div className="d-flex justify-content-between flex-wrap">
                        <div className="stats">
                            <div className="name">Nombre</div>
                            <div className="value">{latest(stats.nbSessions)}</div>
                        </div>
                        <div className="stats">
                            <div className="name">Taux</div>
                            <div>
                                <span className="value highlighted">
                                    {percentage(latest(stats.nbAvisRestituables), latest(stats.nbAvis))}
                                </span>
                                {regional &&
                                <span className="value compare ml-3">
                                    {percentage(latest(national.nbAvisRestituables), latest(national.nbAvis))}*
                                </span>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className="details">
                    <div className="d-flex justify-content-start flex-wrap">
                        <div className="stats">
                            <div className="name">Nombre d'avis moyen par session</div>
                            <div className="value">
                                {divide(latest(stats.nbAvisRestituables), latest(stats.nbAvis))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
