import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Panel from '../../common/page/panel/Panel';
import { getPublicStatistics } from '../../../services/statsService';
import HistoryLines from './HistoryLines';
import Button from '../../../../common/components/Button';

export default class StatsPanel extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
        onFilterClicked: PropTypes.func.isRequired,
    };

    constructor() {
        super();
        this.state = {
            stats: null,
        };
    }

    componentDidMount() {
        this.fetchStats();
    }

    componentDidUpdate(previous) {
        if (!_.isEqual(this.props.query, previous.query)) {
            this.fetchStats();
        }
    }

    fetchStats = () => {
        return new Promise(async resolve => {
            let stats = await getPublicStatistics(this.props.query);
            this.setState({ stats }, () => resolve());
        });
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

    percentage = (dividend, divisor) => {
        if (dividend && divisor !== 0) {
            let value = (dividend * 100) / divisor;
            return Number(Math.round(value + 'e1') + 'e-1') + '%';
        } else {
            return 0 + '%';
        }
    };

    latest = history => {
        return history[history.length - 1].value;
    };

    render() {

        if (_.isEmpty(this.state.stats)) {
            return <div></div>;
        }

        let regional = _.omit(this.state.stats, ['meta']);
        let national = this.state.stats.meta.national;

        return (
            <Panel
                summary={
                    <div className="row">
                        <div className="offset-sm-8 col-sm-4 text-right">
                            <Button
                                size="medium"
                                onClick={() => console.log('export')}>
                                <i className="fas fa-download pr-2"></i>Exporter
                            </Button>
                        </div>
                    </div>
                }
                results={
                    <div>
                        <div className="row py-3">
                            <div className="col-sm-5">
                                <div className="region pb-5">{regional.label}</div>
                                <div className="d-flex justify-content-start text-center">
                                    <div className="d-flex flex-column stats">
                                        <div>
                                            <div className="name">Répondants</div>
                                            <div
                                                className="value">{this.latest(regional.nbQuestionnairesValidees)}</div>
                                        </div>
                                    </div>
                                    <div className="d-flex flex-column stats px-4">
                                        <div>
                                            <div className="name">Taux</div>
                                            <div className="value regional">
                                                {this.percentage(this.latest(regional.nbQuestionnairesValidees), this.latest(regional.nbStagiairesContactes))}
                                            </div>
                                        </div>
                                        <div className="pt-5">
                                            <div className="name">Moyenne nationale</div>
                                            <div className="value national">
                                                {this.percentage(this.latest(national.nbQuestionnairesValidees), this.latest(national.nbStagiairesContactes))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-7" style={{ height: '480px' }}>
                                <HistoryLines
                                    data={[
                                        this.convertToLine('Résultats région', regional.nbQuestionnairesValidees),
                                        this.convertToLine('Moyenne nationale', national.nbQuestionnairesValidees),
                                    ]}
                                    colors={['#F28017', '#384EAA']}
                                />
                            </div>
                        </div>
                    </div>
                }
            />
        );
    }
}
