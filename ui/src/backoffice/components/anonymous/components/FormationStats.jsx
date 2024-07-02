import React from 'react';
import PropTypes from 'prop-types';
import './Stats.scss';
import { diff, latest } from '../../../services/statsService';
import { formatNumber, percentage } from '../../../utils/number-utils';

export default class FormationStats extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
        store: PropTypes.object.isRequired,
        stats: PropTypes.array.isRequired,
        form: PropTypes.object.isRequired,
    };

    render() {
        let { query, store, stats, form } = this.props;
        const { fin } = form;
        let type = query.codeRegion ? 'regional' : 'national';

        return (
            <div className="Stats">
                <div className="main with-details d-flex flex-column">
                    <h2 className="title" >
                        <div>
                            <span aria-hidden="true" className="fas fa-graduation-cap a-icon"></span>
                            Formations
                            <span className="asterisque" style={{"marginLeft":"10px"}}>
                                {'(depuis le: 01/01/2018 -'}
                                {fin ? " jusqu'au: "+new Date(fin).toLocaleDateString()+")" : "jusqu'à: Aujourd'hui)"}
                            </span>
                        </div>
                        <div className="description">(source Intercarif)</div>
                    </h2>
                    <div className="d-flex justify-content-between flex-wrap">
                        <div className="stats" >
                            <div className="name">Formations en ligne</div>
                            <div className="value">{formatNumber(latest(stats, type, 'api.nbSessions'))}</div>
                        </div>
                        <div className="stats" >
                            <div className="name">Formations avec un avis</div>
                            <div>
                                <span className="value highlighted">
                                    {percentage(latest(stats, type, 'api.nbSessionsAvecAvis'), latest(stats, type, 'api.nbSessions'))}%
                                </span>
                                {type !== 'regional' && (
                                    <span className="sr-only">National</span>
                                )}

                                {type === 'regional' && (
                                    <>
                                         <span className="sr-only">Region {store.regions.find((element) => element.codeRegion === query.codeRegion)?.nom}</span>
                                        <span className="value compare">
                                            {percentage(latest(stats, 'national', 'api.nbSessionsAvecAvis'), latest(stats, 'national', 'api.nbSessions')).toFixed(2)}%*
                                        </span>
                                        <span className="sr-only">National</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="details">
                    <div className="stats" >
                        <div className="name">Nombre d&apos;avis moyen par session</div>
                        <div className="value">{latest(stats, type, 'api.nbAvisParSession')}</div>
                    </div>
                </div>
            </div>
        );
    }
}
