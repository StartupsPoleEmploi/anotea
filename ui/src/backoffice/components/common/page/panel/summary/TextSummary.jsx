import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import "./TextSummary.scss";

const TextSummary = ({ form, query }) => {

    let { departements, formations } = form;

    let departement = departements && departements.results.find(f => f.code === query.departement);
    let formation = formations && formations.results.find(f => f.idFormation === query.idFormation);
    let startDate = query.startDate ? moment(parseInt(query.startDate)).format("DD/MM/YYYY") : null;
    let endDate = moment(query.scheduledEndDate ? parseInt(query.scheduledEndDate) : new Date()).format("DD/MM/YYYY");

    return (
        <div className="TextSummary d-flex justify-content-center align-items-center">
            <span>
                Formation échues {startDate ? `entre le ${startDate} et le ${endDate}` : `jusqu'au ${endDate}`}
            </span>
            <span>{departement ? departement.label : "Tous les départements"}</span>
            <span>{formation ? formation.title : "Toutes les formations"}</span>
        </div>
    );
};

TextSummary.propTypes = {
    query: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
};

export default TextSummary;
