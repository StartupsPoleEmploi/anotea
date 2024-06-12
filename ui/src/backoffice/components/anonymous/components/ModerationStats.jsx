import React from 'react';
import PropTypes from 'prop-types';
import './Stats.scss';
import { diff, latest } from '../../../services/statsService';
import { formatNumber } from '../../../utils/number-utils';

export default class ModerationStats extends React.Component {

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
                        Modération
                        <span className="asterisque" style={{"marginLeft":"10px"}}>
                            {'(depuis le: 01/01/2018 -'}
                            {fin ? " jusqu'au: "+new Date(fin).toLocaleDateString()+")" : "jusqu'à: Aujourd'hui)"}
                        </span>
                    </h2>
                    <div className="d-flex justify-content-between flex-wrap">
                        <div className="stats" >
                            <div className="name">Avis à modérer</div>
                            <div className="value">{formatNumber(latest(stats, type, 'avis.nbCommentairesAModerer'))}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
