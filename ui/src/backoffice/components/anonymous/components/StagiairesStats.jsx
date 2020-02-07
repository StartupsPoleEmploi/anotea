import React from 'react';
import PropTypes from 'prop-types';
import HistoryLines, { convertToRatioLine } from './HistoryLines';
import './Stats.scss';
import { diff, latest } from '../../../services/statsService';
import { formatNumber, percentage } from '../../../utils/number-utils';

export default class StagiairesStats extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
        stats: PropTypes.array.isRequired,
    };

    render() {
        let { query, stats } = this.props;
        let type = query.codeRegion ? 'regional' : 'national';
        let groupBy = 'month';
        let lines = [
            ...(type === 'regional' ? [
                convertToRatioLine(stats, 'national', 'avis.nbAvis', 'avis.nbStagiairesContactes', { groupBy })
            ] : []),
            convertToRatioLine(stats, type, 'avis.nbAvis', 'avis.nbStagiairesContactes', { groupBy }),
        ];

        return (
            <div className="Stats">
                <div className="main d-flex justify-content-center justify-content-lg-between">
                    <div className="d-flex flex-column">
                        <div className="title">
                            <i className="far fa-user a-icon"></i>
                            Stagiaires
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
                    </div>
                    <div className="flex-grow-1" style={{ height: '300px', minWidth: '250px' }}>
                        <HistoryLines
                            lines={lines}
                            colors={type === 'regional' ? ['rgba(35, 47, 56, 0.4)', '#F28017'] : ['#F28017']}
                            groupBy={groupBy}
                            format={v => `${v}%`}
                            formatTooltip={data => {
                                return (
                                    <div className="d-flex justify-content-between text-left">
                                        <span className="mr-2">{`Avis : ${formatNumber(data.bucket['avis.nbAvis'])}`}</span>
                                        <span>{`Stagiaires contactés : ${formatNumber(data.bucket['avis.nbStagiairesContactes'])}`}</span>
                                    </div>
                                );
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
