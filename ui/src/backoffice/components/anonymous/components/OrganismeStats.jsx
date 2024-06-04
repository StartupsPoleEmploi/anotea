import React from 'react';
import PropTypes from 'prop-types';
import './Stats.scss';
import { latest } from '../../../services/statsService';
import { formatNumber, percentage } from '../../../utils/number-utils';

export default class OrganismeStats extends React.Component {
   
    static propTypes = {
        query: PropTypes.object.isRequired,
        stats: PropTypes.array.isRequired,
        form: PropTypes.object.isRequired,
    };

    render() {
        let { query, stats, form } = this.props;
        const { fin } = form;
        let type = query.codeRegion ? 'regional' : 'national';

        return (
            <div className="Stats">
                <div className="main with-details d-flex flex-column">
                    <h2 className="title" >
                        <span aria-hidden="true" className="far fa-comment-alt a-icon"></span>
                        Organismes
                        <span className="asterisque" style={{"marginLeft":"10px"}}>
                            {'(DEPUIS LE: 01/01/2018 -'}
                            {fin ? " JUSQU'AU: "+new Date(fin).toLocaleDateString()+")" : "JUSQU'A: Aujourd'hui)"}
                        </span>
                    </h2>
                    <div className="d-flex justify-content-between flex-wrap">
                        <div className="stats" >
                            <div className="name">Organismes actifs</div>
                            <div className="value">{formatNumber(latest(stats, type, 'organismes.nbOrganismesActifs'))}</div>
                        </div>
                        <div className="stats" >
                            <div className="name">Taux de commentaires avec réponse</div>
                            <div>
                                <span className="value highlighted">
                                    {percentage(latest(stats, type, 'avis.nbReponses'), latest(stats, type, 'avis.nbAvisAvecCommentaire'))}%
                                </span>
                                {type === 'regional' &&
                                <span className="value compare">
                                    {percentage(latest(stats, 'national', 'avis.nbReponses'), latest(stats, 'national', 'avis.nbAvisAvecCommentaire'))}%*
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
