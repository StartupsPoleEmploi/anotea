import React from 'react';
import PropTypes from 'prop-types';
import HistoryLines, { convertToRatioLine } from './HistoryLines';
import './Stats.scss';
import { diff, latest } from '../../../services/statsService';
import { formatNumber, percentage } from '../../../utils/number-utils';

export default class AvisStats extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
        stats: PropTypes.array.isRequired,
    };

    render() {
        let { query, stats } = this.props;
        let type = query.codeRegion ? 'regional' : 'national';
        let groupBy = 'month';

        return (
            <div className="Stats">
                <div className="main d-flex justify-content-center justify-content-lg-between">
                    <div className="d-flex flex-column">
                        <div className="title">
                            Avis
                        </div>
                        <div className="d-flex justify-content-around flex-wrap">
                            <div className="stats">
                                <div className="name">Nombre de stagiaires contactés</div>
                                <div
                                    className="value">{formatNumber(latest(stats, type, 'avis.nbStagiairesContactes'))}
                                </div>
                            </div>
                            <div className="stats">
                                <div className="name">Taux répondants</div>
                                <div>
                                    <span className="value highlighted">
                                        {percentage(diff(stats, type, 'avis.nbAvis'), diff(stats, type, 'avis.nbStagiairesContactes'))}%
                                    </span>
                                    {type === 'regional' &&
                                    <span className="value compare">
                                        {percentage(diff(stats, 'national', 'avis.nbAvis'), diff(stats, 'national', 'avis.nbStagiairesContactes'))}%*
                                    </span>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="d-flex justify-content-around flex-wrap mt-3">
                            <div className="stats">
                                <div className="name">Total avis déposés</div>
                                <div className="value">{formatNumber(latest(stats, type, 'avis.nbAvis'))}</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-grow-1" style={{ height: '300px', minWidth: '250px' }}>
                        <HistoryLines
                            colors={type === 'regional' ? ['rgba(35, 47, 56, 0.4)', '#F28017'] : ['rgba(35, 47, 56, 0.4)']}
                            groupBy={groupBy}
                            format={v => `${v}%`}
                            lines={[
                                convertToRatioLine(stats, type, 'avis.nbAvis', 'avis.nbStagiairesContactes', {
                                    groupBy,
                                    tooltip: data => `Stagiaires : ${data}`,
                                }),
                                ...(type === 'regional' ? [
                                    convertToRatioLine(stats, 'national', 'avis.nbAvis', 'avis.nbStagiairesContactes', {
                                        groupBy,
                                        tooltip: data => `Stagiaires : ${data}`,
                                    })
                                ] : []),
                            ]}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
