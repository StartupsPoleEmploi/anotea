import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import PrettyDate from "../PrettyDate";
import "./Status.scss";

export const Workflow = ({ avis, showStatus }) => {

    const getStatus = avis => {

        if (!avis.comment) {
            return <div />;
        }

        switch (avis.status) {
            case "none":
                return <div className="none">(&Agrave; modérer)</div>;
            case "archived":
                return <div className="Status">(Archivé)</div>;
            case "validated":
                return (
                    <div className="validated">
                        (<span>Validé le </span> <PrettyDate date={new Date(avis.lastStatusUpdate)} />)
                    </div>
                );
            case "rejected":
                return (
                    <div className="rejected">
                        (<span>Rejeté le </span>
                        <PrettyDate date={new Date(avis.lastStatusUpdate)} /> pour « <b>{avis.qualification}</b> »)
                    </div>
                );
            case "reported":
                return (
                    <div className="reported">
                        (<span>Signalé le </span> <PrettyDate date={new Date(avis.lastStatusUpdate)} />)
                    </div>
                );
            default:
                return <div />;
        }
    };

    return (
        <div className="Status">
            <div className="date">
                le <PrettyDate date={new Date(avis.date)} /> &nbsp;
            </div>
            {showStatus &&
            getStatus(avis)
            }
        </div>
    );
};
Workflow.propTypes = {
    avis: PropTypes.object.isRequired,
    showStatus: PropTypes.bool,
};
Workflow.defaultProps = {
    showStatus: true,
};

export const ReconciliationWorkflow = ({ avis }) => {

    const getStatus = avis => {
        let reconciliations = _.get(avis, "meta.reconciliations", []);
        let isOnline = avis.status === "validated" && reconciliations.length > 0 && reconciliations[0].reconciliable;

        if (isOnline) {
            return (
                <div className="reconciliated">
                    (En ligne)
                </div>
            );
        } else {
            return <div />;
        }
    };


    return (
        <div className="Status">
            <div className="date">
                le <PrettyDate date={new Date(avis.date)} /> &nbsp;
            </div>
            {getStatus(avis)}
        </div>
    );
};
ReconciliationWorkflow.propTypes = {
    avis: PropTypes.object.isRequired,
};


