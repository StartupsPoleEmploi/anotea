import React from 'react';
import PropTypes from 'prop-types';
import HistoryLines from './HistoryLines';
import './Stats.scss';
import PrettyDate from '../../common/PrettyDate';
import { latest, percentage } from '../../../services/statsService';

export default class GlobalStats extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
        stats: PropTypes.object.isRequired,
    };

    convertToLine = (id, history) => {
        let data = history.map((h, index) => {
            let previous = history[index - 1] || { value: 0 };
            let yValue = h.value - previous.value;
            return { x: h.date, y: yValue };
        });
        data.shift();
        return {
            id,
            data: data
        };
    };

    render() {
        let { query } = this.props;
        let regional = this.props.stats.avis.regional;
        let national = this.props.stats.avis.national;
        let stats = regional || national;

        return (
            <div className="Stats">
                <div className="main d-flex justify-content-center justify-content-lg-between">
                    <div className="d-flex flex-column">
                        <div className="title mb-5">
                            <PrettyDate
                                date={query.debut ? new Date(parseInt(query.debut)) : new Date()}
                                format={'MMMM YYYY'}
                                transform={d => d.charAt(0).toUpperCase() + d.slice(1)}
                            />
                            {query.fin &&
                            <>
                                <span className="px-1">-</span>
                                <PrettyDate
                                    date={query.fin ? new Date(parseInt(query.fin)) : new Date()}
                                    format={'MMMM YYYY'}
                                    transform={d => d.charAt(0).toUpperCase() + d.slice(1)}
                                />
                            </>
                            }
                        </div>
                        <div className="d-flex justify-content-around text-center flex-wrap">
                            <div className="stats">
                                <div className="name">Total avis déposés</div>
                                <div className="value">{latest(stats.nbQuestionnairesValidees)}</div>
                            </div>
                            <div className="stats">
                                <div className="name">Taux répondants</div>
                                <div>
                                    <span className="value highlighted">
                                        {percentage(latest(stats.nbQuestionnairesValidees), latest(stats.nbStagiairesContactes))}
                                    </span>
                                    {regional &&
                                    <span className="value compare ml-3">
                                        {percentage(latest(national.nbQuestionnairesValidees), latest(national.nbStagiairesContactes))}*
                                    </span>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-grow-1" style={{ height: '300px', minWidth: '250px' }}>
                        <HistoryLines
                            data={[
                                this.convertToLine('Nationale', national.nbQuestionnairesValidees),
                                ...(regional ? [this.convertToLine('Régional', regional.nbQuestionnairesValidees)] : []),
                            ]}
                            colors={[...(regional ? ['rgba(35, 47, 56, 0.4)'] : []), '#F28017']}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
