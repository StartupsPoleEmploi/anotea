import React from "react";
import PropTypes from "prop-types";
import "./Tooltip.scss";

const Tooltip = ({ overflow, value }) => {
    return (
        <div className="Tooltip">
            <div className="triangle"></div>
            <div className={`message ${overflow ? `with-overflow-${overflow}` : ""}`}>
                {value}
            </div>
        </div>
    );
};

Tooltip.propTypes = {
    value: PropTypes.node.isRequired,
    overflow: PropTypes.string,
};

export default Tooltip;
