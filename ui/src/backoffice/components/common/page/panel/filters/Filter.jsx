import React from "react";
import PropTypes from "prop-types";
import "./Filter.scss";
import Pastille from "../../../Pastille";
import AnalyticsContext from "../../../../../../common/components/analytics/AnalyticsContext";

const Filter = ({ label, isActive, onClick, getNbElements = () => -1, isDisabled = () => false }) => {

    let { trackClick } = React.useContext(AnalyticsContext);

    return (
        <li className={`Filter nav-item ${isActive() ? "active" : ""} ${isDisabled() ? "disabled" : ""}`}>
            <a
                href="/#"
                className={`nav-link`}
                onClick={e => {
                    e.preventDefault();
                    trackClick(label);
                    onClick(e);
                }}
            >
                <div className="Pastille--holder">
                    {label}
                    {getNbElements() > 0 ? <Pastille value={getNbElements()} /> : <span />}
                </div>
            </a>
        </li>
    );
};
Filter.propTypes = {
    label: PropTypes.string.isRequired,
    isActive: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    getNbElements: PropTypes.func,
    isDisabled: PropTypes.func,
};

export default Filter;
