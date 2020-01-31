import React from 'react';
import PropTypes from 'prop-types';
import './Stats.scss';
import { percentage } from '../../../services/statsService';

export default class OrganismeStats extends React.Component {

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
                            <div className="value">{current.organismes.nbOrganismesActifs}</div>
                        </div>
                        <div className="stats">
                            <div className="name">Avis répondus</div>
                            <div className="value">{current.avis.nbReponses}</div>
                        </div>
                        <div className="stats">
                            <div className="name">Taux réponse</div>
                            <div>
                                <span className="value highlighted">
                                    {percentage(current.avis.nbReponses, current.avis.nbAvis)}
                                </span>
                                {regional &&
                                <span className="value compare">
                                    {percentage(current.avis.nbReponses, current.avis.nbAvis)}*
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
