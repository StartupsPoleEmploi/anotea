import React from 'react';
import PropTypes from 'prop-types';
import './Stats.scss';
import { latest } from '../../../services/statsService';
import { formatNumber, percentage } from '../../../utils/number-utils';

export default class ModerationStats extends React.Component {

    static propTypes = {
        query: PropTypes.object.isRequired,
        stats: PropTypes.array.isRequired,
    };

    render() {
        let { query, stats } = this.props;
        let type = query.codeRegion ? 'regional' : 'national';

        return (
            <div className="Stats">
                <div className="main with-details d-flex flex-column">
                    <div className="title">
                        <div>
                            <i className="far fa-comment-alt a-icon"></i>
                            Modération
                        </div>
                    </div>
                    <div className="d-flex justify-content-between flex-wrap">
                        <div className="stats">
                            <div className="name">Avis à modérer</div>
                            <div className="value">{formatNumber(latest(stats, type, 'avis.nbCommentairesAModerer'))}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
