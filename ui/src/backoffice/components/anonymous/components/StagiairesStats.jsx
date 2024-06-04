import React from 'react';
import PropTypes from 'prop-types';
import HistoryLines, { convertToRatioLine } from './HistoryLines';
import './Stats.scss';
import { diff, latest } from '../../../services/statsService';
import { formatNumber, percentage } from '../../../utils/number-utils';

export default class StagiairesStats extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
        store: PropTypes.object.isRequired,
        stats: PropTypes.array.isRequired,
        form: PropTypes.object.isRequired,
    };

    render() {
        let { form, query, store, stats } = this.props;
        const { codeRegion, debut, fin } = form;
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
                        <h2 className="title" >
                            <span aria-hidden="true" className="far fa-user a-icon"></span>
                            Stagiaires
                            <span className="asterisque" style={{"marginLeft":"10px"}}>
                                {debut ? " (DEPUIS LE: "+new Date(debut).toLocaleDateString() : '(DEPUIS LE: 01/01/2018 -' /*getFullYear*/}
                                {fin ? " JUSQU'AU: "+new Date(fin).toLocaleDateString()+")" : "JUSQU'A: Aujourd'hui)"}
                            </span>
                        </h2>
                        <div className="d-flex justify-content-around flex-wrap">
                            <div className="stats" >
                                <div className="name">Nombre de stagiaires contactés</div>
                                <span className="value">
                                    {formatNumber(diff(stats, type, 'avis.nbStagiairesContactes'))}
                                </span>
                            </div>
                            <div className="stats" >
                                <div className="name">Taux répondants</div>
                                <span className="value highlighted">
                                    {percentage(diff(stats, type, 'avis.nbAvis'), diff(stats, type, 'avis.nbStagiairesContactes'))}%
                                </span>
                                {type !== 'regional' && (
                                    <span className="sr-only">National</span>
                                )}

                                {type === 'regional' && (
                                    <>
                                        <span className="sr-only">Region {store.regions.find((element) => element.codeRegion === query.codeRegion)?.nom}</span>
                                        <span className="value compare">
                                            {percentage(diff(stats, 'national', 'avis.nbAvis'), diff(stats, 'national', 'avis.nbStagiairesContactes'))}%*
                                        </span>
                                        <span className="sr-only">National</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-grow-1" style={{ height: '300px', minWidth: '250px', marginTop: '21px'}}>
                    <HistoryLines
                        lines={lines}
                        colors={type === 'regional' ? ['rgb(35, 47, 56)', '#D14905'] : ['#D14905']}
                        groupBy={groupBy}
                        format={v => `${v}%`}
                        formatTooltip={data => {
                            return (
                                <div className="d-flex justify-content-between text-left" >
                                    <span
                                        className="mr-2">{`Avis : ${formatNumber(data.bucket['avis.nbAvis'])}`}</span>
                                    <span>{`Stagiaires contactés : ${formatNumber(data.bucket['avis.nbStagiairesContactes'])}`}</span>
                                </div>
                            );
                        }}
                    />
                </div>
            </div>
        );
    }
}
