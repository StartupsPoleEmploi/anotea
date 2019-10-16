import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import PrettyDate from '../PrettyDate';
import './Stagiaire.scss';
import Tooltip from '../Tooltip';

const Stars = props => {

    let isDecimalsNumber = props.note % 1 !== 0;
    let note = Math.round(props.note);
    let stars = new Array(5).fill('active', 0, note).fill('empty', note, 5);

    return (
        <span>
            {
                stars.map((star, index) => {
                    let starClass = (isDecimalsNumber && Math.ceil(note) === index + 1 && index <= note) ? 'fa-star-half-alt' : 'fa-star';
                    return <span
                        key={index}
                        className={star === 'active' ? `stars fa ${starClass} active` : 'stars fa fa-star empty'}
                    />;
                })
            }
        </span>
    );
};
Stars.propTypes = { note: PropTypes.number.isRequired };

const Status = ({ avis }) => {

    if (!avis.comment) {
        return <div className="status" />;
    }

    switch (avis.status) {
        case 'archived':
            return <div className="status">(Archivé)</div>;
        case 'reported':
            return (
                <div className="status reported">
                    (<span>Signalé le </span> <PrettyDate date={new Date(avis.lastStatusUpdate)} />)
                </div>
            );
        case 'validated':
            return (
                <div className="status validated">
                    (<span>Validé le </span> <PrettyDate date={new Date(avis.lastStatusUpdate)} />)
                </div>
            );
        case 'rejected':
            return (
                <div className="status rejected">
                    (<span>Rejeté le </span>
                    <PrettyDate date={new Date(avis.lastStatusUpdate)} /> pour « <b>{avis.qualification}</b> »)
                </div>
            );
        case 'none':
            return <div className="status toModerate">(&Agrave; modérer)</div>;
        default:
            return (<div />);
    }
};
Status.propTypes = { avis: PropTypes.object.isRequired };

const Reconciliation = ({ avis }) => {

    let reconciliations = _.get(avis, 'meta.reconciliations', []);

    if (avis.status !== 'validated' || reconciliations.length === 0 || !reconciliations[0].reconciliable) {
        return <div className="reconciliation" />;
    }

    return (
        <div className="Tooltip--holder reconciliation">
            <i className={`fas fa-check`}></i>
            <Tooltip
                overflow={'left'}
                value={<span>Publié depuis le <PrettyDate date={new Date(reconciliations[0].date)} /></span>}
            />
        </div>
    );
};
Reconciliation.propTypes = { avis: PropTypes.object.isRequired };

export default class Stagiaire extends React.Component {

    static propTypes = {
        avis: PropTypes.object.isRequired,
        showStatus: PropTypes.bool,
        showReconcilitation: PropTypes.bool,
    };

    render() {
        let { avis, showStatus, showReconcilitation } = this.props;

        return (
            <div className="Stagiaire">
                <div className="d-flex justify-content-between align-items-center">
                    <Stars note={avis.rates.global} />

                </div>

                <div className="date">
                    le <PrettyDate date={new Date(avis.date)} /> &nbsp;
                    {showStatus &&
                    <Status avis={avis} />
                    }
                    {showReconcilitation &&
                    <Reconciliation avis={avis} />
                    }
                </div>
            </div>
        );
    }
}
