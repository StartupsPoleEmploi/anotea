import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import PrettyDate from '../PrettyDate';
import './Status.scss';

const getReconciliationStatus = avis => {
    let reconciliations = _.get(avis, 'meta.reconciliations', []);
    let isOnline = avis.status === 'validated' && reconciliations.length > 0 && reconciliations[0].reconciliable;

    if (isOnline) {
        return (
            <div className="validated">
                (Publié le <PrettyDate date={new Date(reconciliations[0].date)} />)
            </div>
        );
    } else {
        return <div />;
    }
};

const getStatus = avis => {

    if (!avis.comment) {
        return <div />;
    }

    switch (avis.status) {
        case 'none':
            return <div className="none">(&Agrave; modérer)</div>;
        case 'archived':
            return <div className="Status">(Archivé)</div>;
        case 'validated':
            return (
                <div className="validated">
                    (Validé le <PrettyDate date={new Date(avis.lastStatusUpdate)} />)
                </div>
            );
        case 'rejected':
            return (
                <div className="rejected">
                    (Rejeté le
                    <PrettyDate date={new Date(avis.lastStatusUpdate)} /> pour « <b>{avis.qualification}</b> »)
                </div>
            );
        case 'reported':
            return (
                <div className="reported">
                    (Signalé le <PrettyDate date={new Date(avis.lastStatusUpdate)} />)
                </div>
            );
        default:
            return <div />;
    }
};

const Status = ({ avis, showReconciliation }) => {

    return (
        <div className="Status">
            <div className="date">
                le <PrettyDate date={new Date(avis.date)} /> &nbsp;
            </div>
            {showReconciliation ? getReconciliationStatus(avis) : getStatus(avis)}
        </div>
    );
};
Status.propTypes = {
    avis: PropTypes.object.isRequired,
    showReconciliation: PropTypes.bool,
};

export default Status;

