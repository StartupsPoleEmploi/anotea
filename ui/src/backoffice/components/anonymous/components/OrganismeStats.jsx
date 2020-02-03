import React from 'react';
import PropTypes from 'prop-types';
import './Stats.scss';
import { avg, diff, percentage } from '../../../services/statsService';

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
                            <div className="value">{avg(stats, type, 'organismes.nbOrganismesActifs')}</div>
                        </div>
                        <div className="stats">
                            <div className="name">Avis répondus</div>
                            <div className="value">{diff(stats, type, 'avis.nbReponses')}</div>
                        </div>
                        <div className="stats">
                            <div className="name">Taux réponse</div>
                            <div>
                                <span className="value highlighted">
                                    {percentage(diff(stats, type, 'avis.nbReponses'), diff(stats, type, 'avis.nbAvis'))}
                                </span>
                                {type === 'regional' &&
                                <span className="value compare">
                                    {percentage(diff(stats, 'national', 'avis.nbReponses'), diff(stats, 'national', 'avis.nbAvis'))}*
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
